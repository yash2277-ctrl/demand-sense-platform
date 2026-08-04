from fastapi import APIRouter, Request
from database import SessionLocal
import os

router = APIRouter()


@router.get("/health")
async def health_check(request: Request):
    status = {"database": False, "faiss": False, "llm": False, "overall": False}
    details = {}

    # Check database
    try:
        db = SessionLocal()
        db.execute(
            __import__("sqlalchemy").text("SELECT 1")
        )
        db.close()
        status["database"] = True
        details["database"] = "Connected"
    except Exception as e:
        details["database"] = str(e)

    # Check FAISS / embedding model
    try:
        embed_model = getattr(request.app.state, "embed_model", None)
        status["faiss"] = embed_model is not None
        details["faiss"] = "Model loaded" if embed_model else "Model not loaded (will use dummy data)"
    except Exception as e:
        details["faiss"] = str(e)

    # Check LLM API key
    anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")
    openai_key = os.getenv("OPENAI_API_KEY", "")
    if anthropic_key:
        status["llm"] = True
        details["llm"] = "Anthropic API key configured"
    elif openai_key:
        status["llm"] = True
        details["llm"] = "OpenAI API key configured"
    else:
        details["llm"] = "No API key configured (will use dummy reports)"

    status["overall"] = status["database"]

    return {"status": status, "details": details}
