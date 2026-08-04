from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Prediction, AccuracyRecord
from pydantic import BaseModel
import numpy as np

router = APIRouter()


class AccuracyInput(BaseModel):
    prediction_id: int
    actual_demand: float


@router.post("/accuracy")
async def record_accuracy(req: AccuracyInput, db: Session = Depends(get_db)):
    prediction = db.query(Prediction).filter(Prediction.id == req.prediction_id).first()
    if not prediction:
        return {"error": "Prediction not found"}

    predicted_values = prediction.predicted_values or {}
    pred_vals = predicted_values.get("values", [])
    if not pred_vals:
        return {"error": "No predicted values found"}

    avg_predicted = float(np.mean(pred_vals))
    mae = abs(avg_predicted - req.actual_demand)
    mape = (mae / req.actual_demand * 100) if req.actual_demand != 0 else 0

    if mape < 10:
        status = "Accurate"
    elif avg_predicted > req.actual_demand:
        status = "Overestimated"
    else:
        status = "Underestimated"

    # Update prediction record
    prediction.actual_demand = req.actual_demand
    prediction.mae = round(mae, 2)
    prediction.mape = round(mape, 2)

    # Create accuracy record
    record = AccuracyRecord(
        prediction_id=req.prediction_id,
        product=prediction.product,
        region=prediction.region,
        predicted_demand=round(avg_predicted, 2),
        actual_demand=req.actual_demand,
        mae=round(mae, 2),
        mape=round(mape, 2),
        status=status,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    # Get overall metrics
    all_records = db.query(AccuracyRecord).all()
    avg_mae = float(np.mean([r.mae for r in all_records])) if all_records else 0
    avg_mape = float(np.mean([r.mape for r in all_records])) if all_records else 0

    return {
        "record": {
            "id": record.id,
            "prediction_id": record.prediction_id,
            "product": record.product,
            "region": record.region,
            "predicted_demand": record.predicted_demand,
            "actual_demand": record.actual_demand,
            "mae": record.mae,
            "mape": record.mape,
            "status": record.status,
        },
        "summary": {
            "average_mae": round(avg_mae, 2),
            "average_mape": round(avg_mape, 2),
            "total_records": len(all_records),
        },
    }


@router.get("/accuracy")
async def list_accuracy(db: Session = Depends(get_db)):
    records = db.query(AccuracyRecord).order_by(AccuracyRecord.created_at.desc()).all()

    avg_mae = float(np.mean([r.mae for r in records])) if records else 0
    avg_mape = float(np.mean([r.mape for r in records])) if records else 0

    return {
        "records": [
            {
                "id": r.id,
                "prediction_id": r.prediction_id,
                "product": r.product,
                "region": r.region,
                "predicted_demand": r.predicted_demand,
                "actual_demand": r.actual_demand,
                "mae": r.mae,
                "mape": r.mape,
                "status": r.status,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in records
        ],
        "summary": {
            "average_mae": round(avg_mae, 2),
            "average_mape": round(avg_mape, 2),
            "total_records": len(records),
        },
    }
