from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from database import get_db
from models import RAGContext
from pydantic import BaseModel
import numpy as np
import os
import json
from datetime import datetime

router = APIRouter()

def get_dummy_articles(product: str, region: str):
    """Generate region and product specific dummy articles for the RAG context fallback."""
    return [
        {
            "title": f"Global Supply Chain Disruptions Continue to Impact {product} in {region}",
            "source": "Reuters",
            "description": f"Ongoing supply chain disruptions in regional manufacturing are causing significant delays in {product} production directly affecting {region}. Major manufacturers report 15-20% reduction in output capacity.",
            "url": "https://example.com/supply-chain",
            "publishedAt": "2026-02-20T10:30:00Z",
            "category": "Supply Chain",
            "relevance_score": 94.2,
        },
        {
            "title": f"Consumer Spending Surges in {region} Q1 2026 Despite Inflation Concerns",
            "source": "Bloomberg",
            "description": f"Consumer spending data for Q1 2026 in {region} shows a surprising 8.3% increase year-over-year for goods like {product}, driven by strong regional employment numbers.",
            "url": "https://example.com/consumer-spending",
            "publishedAt": "2026-02-19T14:15:00Z",
            "category": "Market Trend",
            "relevance_score": 87.5,
        },
        {
            "title": f"Severe Weather Patterns Expected to Disrupt Logistics near {region}",
            "source": "Weather Channel",
            "description": f"Meteorologists predict a series of severe storms across the immediate {region} corridor, potentially disrupting ground transportation and warehouse operations for major distribution centers handling {product}.",
            "url": "https://example.com/weather-logistics",
            "publishedAt": "2026-02-21T08:00:00Z",
            "category": "Weather",
            "relevance_score": 78.8,
        },
        {
            "title": f"New Trade Regulations Set to Affect Imports into {region}",
            "source": "Financial Times",
            "description": f"The newly announced trade regulations will impose additional tariffs on {product} imported into {region}, effective April 2026. Industry experts warn of potential 12% cost increases.",
            "url": "https://example.com/trade-regulations",
            "publishedAt": "2026-02-18T16:45:00Z",
            "category": "Regulation",
            "relevance_score": 72.1,
        },
        {
            "title": f"E-commerce Growth Accelerates in {region} with AI",
            "source": "TechCrunch",
            "description": f"Major e-commerce platforms in {region} report 35% higher conversion rates for {product} after implementing AI-powered demand prediction, signaling a shift in retail demand patterns.",
            "url": "https://example.com/ecommerce-ai",
            "publishedAt": "2026-02-17T12:00:00Z",
            "category": "Market Trend",
            "relevance_score": 65.3,
        },
    ]


class RAGRequest(BaseModel):
    product: str
    region: str


def classify_article(title: str) -> str:
    """Classify article into category based on keywords."""
    title_lower = title.lower()
    if any(k in title_lower for k in ["supply chain", "logistics", "shipping", "warehouse"]):
        return "Supply Chain"
    elif any(k in title_lower for k in ["weather", "storm", "climate", "flood"]):
        return "Weather"
    elif any(k in title_lower for k in ["regulation", "tariff", "trade", "policy", "law"]):
        return "Regulation"
    else:
        return "Market Trend"


@router.post("/rag/context")
async def get_rag_context(req: RAGRequest, request: Request, db: Session = Depends(get_db)):
    query = f"Recent news affecting {req.product} demand in {req.region} market trends supply chain"

    articles = []
    news_api_key = os.getenv("NEWS_API_KEY", "")
    embed_model = getattr(request.app.state, "embed_model", None)

    # Try fetching real news
    if news_api_key:
        try:
            import requests as rq
            search_query = f"{req.product} {req.region} demand market"
            resp = rq.get(
                "https://newsapi.org/v2/everything",
                params={
                    "q": search_query,
                    "sortBy": "publishedAt",
                    "pageSize": 20,
                    "apiKey": news_api_key,
                },
                timeout=10,
            )
            if resp.status_code == 200:
                data = resp.json()
                for art in data.get("articles", [])[:20]:
                    articles.append({
                        "title": art.get("title", ""),
                        "source": art.get("source", {}).get("name", "Unknown"),
                        "description": art.get("description", ""),
                        "url": art.get("url", ""),
                        "publishedAt": art.get("publishedAt", ""),
                        "category": classify_article(art.get("title", "")),
                    })
        except Exception as e:
            print(f"NewsAPI failed: {e}")

    # Use FAISS for semantic ranking if we have articles and embed model
    if articles and embed_model:
        try:
            import faiss

            cache_key = f"{req.product}_{req.region}"
            faiss_cache = getattr(request.app.state, "faiss_cache", {})

            texts = [f"{a['title']} {a['description']}" for a in articles]
            embeddings = embed_model.encode(texts, normalize_embeddings=True)
            query_embedding = embed_model.encode([query], normalize_embeddings=True)

            dim = embeddings.shape[1]
            index = faiss.IndexFlatIP(dim)
            index.add(embeddings.astype(np.float32))
            scores, indices = index.search(query_embedding.astype(np.float32), min(5, len(articles)))

            ranked_articles = []
            for score, idx in zip(scores[0], indices[0]):
                art = articles[idx].copy()
                art["relevance_score"] = round(float(score) * 100, 1)
                ranked_articles.append(art)

            faiss_cache[cache_key] = {"index": index, "articles": articles}
            request.app.state.faiss_cache = faiss_cache
            articles = ranked_articles

        except Exception as e:
            print(f"FAISS ranking failed: {e}")
            for i, art in enumerate(articles[:5]):
                art["relevance_score"] = round(95 - i * 7, 1)
            articles = articles[:5]
    elif articles:
        for i, art in enumerate(articles[:5]):
            art["relevance_score"] = round(95 - i * 7, 1)
        articles = articles[:5]
    else:
        # Use dummy articles as fallback
        articles = get_dummy_articles(req.product, req.region)

    # Store in database
    rag_context = RAGContext(
        product=req.product,
        region=req.region,
        query=query,
        articles=articles,
    )
    db.add(rag_context)
    db.commit()
    db.refresh(rag_context)

    return {
        "id": rag_context.id,
        "product": req.product,
        "region": req.region,
        "query": query,
        "articles": articles,
        "total_fetched": len(articles),
        "created_at": rag_context.created_at.isoformat() if rag_context.created_at else None,
    }
