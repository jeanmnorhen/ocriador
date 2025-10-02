import os
from fastapi import FastAPI, Depends, HTTPException, Security, status
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from celery.result import AsyncResult
from app.celery_worker import generate_keyframes_from_script
from app.schemas import ProcessRequest, ProcessResponse

# --- Security ---
API_KEY = os.environ.get("API_KEY")
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def get_api_key(key: str = Security(api_key_header)):
    if key == API_KEY:
        return key
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Could not validate credentials"
        )

# --- FastAPI App ---
app = FastAPI(title="LLM Animation Assistant")

# --- CORS ---
# As per the plan, allow Vercel deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For simplicity in local dev, but regex is better for prod
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/process", response_model=ProcessResponse, status_code=status.HTTP_202_ACCEPTED)
async def process_script(request: ProcessRequest, api_key: str = Depends(get_api_key)):
    """
    Accepts a script, dispatches it to a Celery worker for processing,
    and returns a task ID.
    """
    task = generate_keyframes_from_script.delay(request.script)
    return {"task_id": task.id}


@app.get("/status/{task_id}")
async def get_status(task_id: str, api_key: str = Depends(get_api_key)):
    """
    Retrieves the status or result of a task.
    """
    task_result = AsyncResult(task_id)
    if task_result.ready():
        if task_result.successful():
            return {"status": "SUCCESS", "result": task_result.get()}
        else:
            return {"status": "FAILURE", "result": str(task_result.info)}
    else:
        return {"status": task_result.status}

@app.get("/")
def read_root():
    return {"message": "LLM Animation Assistant is running."}
