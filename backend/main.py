"""DemandSense — FastAPI Backend"""
from contextlib import asynccontextmanager
from threading import Thread

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import SessionLocal, init_db
from dummy_data import generate_dummy_data

load_dotenv()


def _load_embedding_model(app: FastAPI) -> None:
    try:
        from sentence_transformers import SentenceTransformer

        app.state.embed_model = SentenceTransformer("all-MiniLM-L6-v2")
        print("✅ Sentence transformer loaded")
    except Exception as e:
        app.state.embed_model = None
        app.state.embed_model_error = str(e)
        print(f"⚠️  Sentence transformer not loaded: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    db = SessionLocal()
    try:
        result = generate_dummy_data(db)
        if result:
            print("✅ Dummy data seeded successfully")
        else:
            print("ℹ️  Data already exists, skipping seed")
    finally:
        db.close()

    app.state.embed_model = None
    app.state.embed_model_error = None
    app.state.faiss_cache = {}

    Thread(target=_load_embedding_model, args=(app,), daemon=True).start()
    yield


app = FastAPI(title="DemandSense API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routes.health import router as health_router
from routes.upload import router as upload_router
from routes.predictions import router as predictions_router
from routes.rag import router as rag_router
from routes.reports import router as reports_router
from routes.accuracy import router as accuracy_router
from routes.data import router as data_router
from routes.chat import router as chat_router

app.include_router(health_router, prefix="/api")
app.include_router(upload_router, prefix="/api")
app.include_router(predictions_router, prefix="/api")
app.include_router(rag_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(accuracy_router, prefix="/api")
app.include_router(data_router, prefix="/api")
app.include_router(chat_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "DemandSense API v1.0.0", "docs": "/docs"}
