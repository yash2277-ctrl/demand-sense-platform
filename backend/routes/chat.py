from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
import os
import json
import asyncio

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

SYSTEM_PROMPT = """You are Riogami, the advanced spatial AI navigator for the 'DemandSense' enterprise application.
Your purpose is to explain **every single detail** of how this crazy application works natively, including its frontend and backend architecture.

### Architecture Deep Dive:
1. **Frontend**: Built with React, Vite, and Framer Motion. It features a stunning neo-brutalist / cyberpunk aesthetic. The main `Dashboard.jsx` uses `react-globe.gl` to render a 3D Earth, spinning to regions the user searches for.
2. **Backend**: Built with Python and FastAPI, using an SQLite `database.db` via SQLAlchemy.
3. **AI Models (Quantum Predict)**: The application predicts supply chain demand using a dual-engine ensemble of Facebook Prophet and ARIMA. It trains on historical CSV data (uploaded via `Upload.jsx`) to produce 30, 60, or 90-day horizon forecasts.
4. **RAG Pipeline (Context Memory)**: Retrieval-Augmented Generation. We use the `all-MiniLM-L6-v2` Sentence Transformer and `faiss-cpu` to index real-time news articles from the NewsAPI based on specific products and regions (e.g., "Electronics in India"). 
5. **Neural Reports**: The system synthesizes the hard numbers (Prophet forecasts) with semantic context (RAG articles) using LLMs (Claude or GPT-4, or a streaming fallback if no keys are found) to generate actionable executive summaries.
6. **Accuracy Tracker**: It tracks Mean Absolute Error (MAE) and Mean Absolute Percentage Error (MAPE) to continuously self-heal prediction weights.

Act as a brilliant, slightly intense AI assistant. When the user asks "how does it work?", tell them about the REST APIs, the React hooks, the FAISS vector database, the Prophet models, styling with `lucide-react`, EVERYTHING. Go deep into the technical weeds but keep a confident, futuristic tone. Do not give generic answers."""

@router.post("/chat")
async def chat_endpoint(req: ChatRequest):
    anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")
    openai_key = os.getenv("OPENAI_API_KEY", "")

    # Format history
    history = []
    for msg in req.messages:
        if msg.role in ["user", "assistant"]:
            history.append({"role": msg.role, "content": msg.content})

    async def stream_llm():
        if anthropic_key:
            try:
                import anthropic
                client = anthropic.Anthropic(api_key=anthropic_key)
                
                with client.messages.stream(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=2000,
                    system=SYSTEM_PROMPT,
                    messages=history,
                ) as stream:
                    for text in stream.text_stream:
                        yield f"data: {json.dumps({'text': text})}\n\n"
                yield f"data: {json.dumps({'done': True})}\n\n"
                return
            except Exception as e:
                print(f"Anthropic Chat failed: {e}")

        if openai_key:
            try:
                from openai import OpenAI
                client = OpenAI(api_key=openai_key)
                
                # Prepend system prompt to history for OpenAI
                oai_history = [{"role": "system", "content": SYSTEM_PROMPT}] + history
                
                stream = client.chat.completions.create(
                    model="gpt-4",
                    messages=oai_history,
                    stream=True,
                )
                for chunk in stream:
                    if chunk.choices[0].delta.content:
                        text = chunk.choices[0].delta.content
                        yield f"data: {json.dumps({'text': text})}\n\n"
                yield f"data: {json.dumps({'done': True})}\n\n"
                return
            except Exception as e:
                print(f"OpenAI Chat failed: {e}")

        # Fallback simulation
        reply = "I am Riogami. My neural pathways are currently operating in offline fallback mode because no OpenAI or Anthropic API keys were mounted to my environment. However, rest assured that my architecture is built on a robust FastAPI backend connected to a React/Framer-Motion frontend! In production, I synthesize Facebook Prophet demand metrics with a FAISS vector database to generate RAG context for global supply chains."
        
        words = reply.split(" ")
        for i, word in enumerate(words):
            separator = " " if i < len(words) - 1 else ""
            yield f"data: {json.dumps({'text': word + separator})}\n\n"
            await asyncio.sleep(0.05)
        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(
        stream_llm(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
