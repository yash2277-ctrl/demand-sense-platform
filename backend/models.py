from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, Boolean
from sqlalchemy.sql import func
from database import Base
import datetime


class SalesData(Base):
    __tablename__ = "sales_data"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, nullable=False)
    product = Column(String(100), nullable=False, index=True)
    region = Column(String(100), nullable=False, index=True)
    demand = Column(Float, nullable=False)
    created_at = Column(DateTime, default=func.now())


class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    product = Column(String(100), nullable=False)
    region = Column(String(100), nullable=False)
    horizon = Column(Integer, nullable=False)
    historical_data = Column(JSON)
    predicted_values = Column(JSON)
    confidence_intervals = Column(JSON)
    confidence_score = Column(Float)
    decomposition = Column(JSON)
    created_at = Column(DateTime, default=func.now())
    actual_demand = Column(Float, nullable=True)
    mae = Column(Float, nullable=True)
    mape = Column(Float, nullable=True)


class RAGContext(Base):
    __tablename__ = "rag_contexts"
    id = Column(Integer, primary_key=True, index=True)
    product = Column(String(100), nullable=False)
    region = Column(String(100), nullable=False)
    query = Column(Text)
    articles = Column(JSON)
    created_at = Column(DateTime, default=func.now())


class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    product = Column(String(100), nullable=False)
    region = Column(String(100), nullable=False)
    content = Column(Text)
    prediction_summary = Column(JSON)
    context_articles = Column(JSON)
    created_at = Column(DateTime, default=func.now())


class AccuracyRecord(Base):
    __tablename__ = "accuracy_records"
    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, nullable=False)
    product = Column(String(100))
    region = Column(String(100))
    predicted_demand = Column(Float)
    actual_demand = Column(Float)
    mae = Column(Float)
    mape = Column(Float)
    status = Column(String(50))
    created_at = Column(DateTime, default=func.now())
