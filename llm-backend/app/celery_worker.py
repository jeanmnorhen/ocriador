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

import os
from celery import Celery
from celery.signals import worker_process_init
from llama_cpp import Llama
import instructor
from app.schemas import KeyframeList

# Configure Celery
celery_app = Celery(
    "tasks",
    broker=os.environ.get("CELERY_BROKER_URL", "redis://redis:6379/0"),
    backend=os.environ.get("CELERY_RESULT_BACKEND", "redis://redis:6379/0")
)

# Global variables to hold the model and client for each worker process
llm = None
client = None

@worker_process_init.connect
def init_worker(**kwargs):
    """Initialize LLM client when a worker process starts."""
    global llm, client
    
    print("Loading LLM model for worker process...")
    # The path to the model inside the Docker container
    MODEL_PATH = "/app/models/codellama-7b-instruct.Q4_K_M.gguf"

    try:
        llm = Llama(
            model_path=MODEL_PATH,
            n_ctx=2048,       # Context window
            n_threads=6,      # As per the plan for Xeon E5-2673 v3
            n_gpu_layers=0,   # CPU only
            chat_format="llama-2" # Explicitly set chat format
        )
        # The correct way to patch llama-cpp-python for structured output
        client = instructor.patch(
            create=llm.create_chat_completion,
            mode=instructor.Mode.JSON,
        )
        print("LLM model loaded successfully for worker.")
    except Exception as e:
        print(f"Error loading LLM model for worker: {e}")
        # llm and client will remain None, tasks will fail

@celery_app.task
def generate_keyframes_from_script(script: str):
    if not client:
        raise RuntimeError("LLM client is not available in this worker process.")

    # Use a chat-based prompt structure for better results with instruct models
    messages = [
        {
            "role": "system",
            "content": f"""You are a helpful assistant that generates animation keyframes.
The stage is 800 pixels wide and 600 pixels high.
You must respond with a JSON object that strictly follows this Pydantic schema:
{KeyframeList.model_json_schema()}""",
        },
        {
            "role": "user",
            "content": f"""Analyze the following animation script and suggest initial positions (x, y, rotation) for characters at frame 0.

Script: "{script}"

Based on the script, generate the keyframes. If no characters are mentioned or positions can't be inferred, return an empty list.""",
        },
    ]
    
    try:
        # The correct way to call the patched client
        response = client(
            messages=messages,
            response_model=KeyframeList,
            max_retries=2,
        )
        return response.model_dump()
    except Exception as e:
        print(f"Error during LLM inference: {e}")
        return {"error": str(e)}
