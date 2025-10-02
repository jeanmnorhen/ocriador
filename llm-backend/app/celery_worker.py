import os
from celery import Celery
from llama_cpp import Llama
import instructor
from app.schemas import KeyframeList

# Configure Celery
celery_app = Celery(
    "tasks",
    broker=os.environ.get("CELERY_BROKER_URL", "redis://redis:6379/0"),
    backend=os.environ.get("CELERY_RESULT_BACKEND", "redis://redis:6379/0")
)

# Load the model once when the worker starts
# This is a "hot worker" approach
print("Loading LLM model...")
# The path to the model inside the Docker container
MODEL_PATH = "/app/models/codellama-7b-instruct.Q4_K_M.gguf"

try:
    llm = Llama(
        model_path=MODEL_PATH,
        n_ctx=2048,       # Context window
        n_threads=6,      # As per the plan for Xeon E5-2673 v3
        n_gpu_layers=0    # CPU only
    )
    # Patch the Llama instance with instructor
    client = instructor.patch(llm)
    print("LLM model loaded successfully.")
except Exception as e:
    print(f"Error loading LLM model: {e}")
    llm = None
    client = None

@celery_app.task
def generate_keyframes_from_script(script: str):
    if not client:
        raise RuntimeError("LLM client is not available.")

    prompt = f"""
    Analyze the following animation script and suggest initial positions (x, y, rotation) for characters at frame 0.
    The stage is 800 pixels wide and 600 pixels high.
    
    Script: "{script}"
    
    You must respond with a JSON object that strictly follows this Pydantic schema:
    {KeyframeList.model_json_schema()}
    
    Based on the script, generate the keyframes. If no characters are mentioned or positions can't be inferred, return an empty list.
    """
    
    try:
        response = client.create_completion(
            prompt=prompt,
            response_model=KeyframeList,
            max_retries=2,
        )
        return response.model_dump()
    except Exception as e:
        print(f"Error during LLM inference: {e}")
        return {"error": str(e)}
