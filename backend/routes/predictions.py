from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import SalesData, Prediction
from pydantic import BaseModel
import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings("ignore")

router = APIRouter()


class PredictionRequest(BaseModel):
    product: str
    region: str
    horizon: int = 30


def run_prophet(df_ts, horizon):
    """Run Prophet model for time-series prediction."""
    try:
        from prophet import Prophet
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
        )
        model.add_country_holidays(country_name="US")
        model.fit(df_ts)

        future = model.make_future_dataframe(periods=horizon)
        forecast = model.predict(future)

        predicted = forecast.tail(horizon)
        decomp = forecast[["ds", "trend", "yearly", "weekly", "yhat"]].copy()

        return {
            "dates": [d.isoformat() for d in predicted["ds"]],
            "values": predicted["yhat"].tolist(),
            "lower": predicted["yhat_lower"].tolist(),
            "upper": predicted["yhat_upper"].tolist(),
            "trend": decomp["trend"].tolist(),
            "seasonality": decomp["yearly"].tolist(),
            "residuals": (decomp["yhat"] - decomp["trend"] - decomp["yearly"]).tolist(),
        }
    except Exception as e:
        print(f"Prophet failed: {e}")
        return None


def run_arima(df_ts, horizon):
    """Run ARIMA model for time-series prediction."""
    try:
        from statsmodels.tsa.arima.model import ARIMA
        values = df_ts["y"].values

        best_aic = float("inf")
        best_order = (1, 1, 1)
        for p in range(3):
            for d in range(2):
                for q in range(3):
                    try:
                        model = ARIMA(values, order=(p, d, q))
                        result = model.fit()
                        if result.aic < best_aic:
                            best_aic = result.aic
                            best_order = (p, d, q)
                    except:
                        continue

        model = ARIMA(values, order=best_order)
        result = model.fit()
        forecast = result.get_forecast(steps=horizon)
        pred = forecast.predicted_mean
        conf = forecast.conf_int()

        last_date = df_ts["ds"].max()
        dates = pd.date_range(start=last_date + timedelta(days=1), periods=horizon)

        return {
            "dates": [d.isoformat() for d in dates],
            "values": pred.tolist(),
            "lower": conf.iloc[:, 0].tolist(),
            "upper": conf.iloc[:, 1].tolist(),
        }
    except Exception as e:
        print(f"ARIMA failed: {e}")
        return None


def generate_dummy_prediction(df_ts, horizon):
    """Generate a simple fallback prediction."""
    last_date = df_ts["ds"].max()
    last_values = df_ts["y"].tail(30).values
    mean_val = float(np.mean(last_values))
    std_val = float(np.std(last_values))
    trend_per_day = float(np.polyfit(range(len(last_values)), last_values, 1)[0])

    dates = pd.date_range(start=last_date + timedelta(days=1), periods=horizon)
    np.random.seed(42)
    predicted = []
    for i in range(horizon):
        seasonal = std_val * 0.5 * np.sin(2 * np.pi * i / 30)
        val = mean_val + trend_per_day * i + seasonal + np.random.normal(0, std_val * 0.2)
        predicted.append(max(10, val))

    lower = [v - std_val * 1.5 for v in predicted]
    upper = [v + std_val * 1.5 for v in predicted]

    trend = [mean_val + trend_per_day * i for i in range(len(df_ts) + horizon)]
    seasonality = [std_val * 0.5 * np.sin(2 * np.pi * i / 365) for i in range(len(df_ts) + horizon)]
    residuals = [float(np.random.normal(0, std_val * 0.1)) for _ in range(len(df_ts) + horizon)]

    return {
        "dates": [d.isoformat() for d in dates],
        "values": predicted,
        "lower": lower,
        "upper": upper,
        "trend": trend,
        "seasonality": seasonality,
        "residuals": residuals,
    }


@router.post("/predict")
async def predict(req: PredictionRequest, db: Session = Depends(get_db)):
    # Fetch historical data
    records = (
        db.query(SalesData)
        .filter(SalesData.product == req.product, SalesData.region == req.region)
        .order_by(SalesData.date)
        .all()
    )

    if not records:
        return {"error": "No data found for the given product and region"}

    df = pd.DataFrame([{"ds": r.date, "y": r.demand} for r in records])
    historical = [{"date": r.date.isoformat(), "demand": r.demand} for r in records]

    # Try Prophet
    prophet_result = run_prophet(df.copy(), req.horizon)

    # Try ARIMA
    arima_result = run_arima(df.copy(), req.horizon)

    # Ensemble or fallback
    if prophet_result and arima_result:
        # Weighted ensemble: 70% Prophet, 30% ARIMA
        prophet_weight = 0.7
        arima_weight = 0.3
        ensembled_values = [
            prophet_weight * p + arima_weight * a
            for p, a in zip(prophet_result["values"], arima_result["values"])
        ]
        ensembled_lower = [
            prophet_weight * p + arima_weight * a
            for p, a in zip(prophet_result["lower"], arima_result["lower"])
        ]
        ensembled_upper = [
            prophet_weight * p + arima_weight * a
            for p, a in zip(prophet_result["upper"], arima_result["upper"])
        ]
        result = {
            "dates": prophet_result["dates"],
            "values": ensembled_values,
            "lower": ensembled_lower,
            "upper": ensembled_upper,
            "trend": prophet_result["trend"],
            "seasonality": prophet_result["seasonality"],
            "residuals": prophet_result["residuals"],
        }
    elif prophet_result:
        result = prophet_result
    elif arima_result:
        result = arima_result
        result["trend"] = []
        result["seasonality"] = []
        result["residuals"] = []
    else:
        result = generate_dummy_prediction(df, req.horizon)

    # Calculate confidence
    last_30 = df["y"].tail(30).values
    mean_demand = float(np.mean(last_30))
    if mean_demand > 0:
        mape = float(np.mean(np.abs(np.diff(last_30)) / mean_demand) * 100)
        confidence = max(0, min(100, 100 - mape))
    else:
        confidence = 50.0

    # Store prediction
    prediction = Prediction(
        product=req.product,
        region=req.region,
        horizon=req.horizon,
        historical_data=historical,
        predicted_values={
            "dates": result["dates"],
            "values": [round(v, 2) for v in result["values"]],
        },
        confidence_intervals={
            "lower": [round(v, 2) for v in result["lower"]],
            "upper": [round(v, 2) for v in result["upper"]],
        },
        confidence_score=round(confidence, 1),
        decomposition={
            "trend": [round(v, 2) for v in result.get("trend", [])],
            "seasonality": [round(v, 2) for v in result.get("seasonality", [])],
            "residuals": [round(v, 2) for v in result.get("residuals", [])],
        },
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return {
        "id": prediction.id,
        "product": req.product,
        "region": req.region,
        "horizon": req.horizon,
        "historical": historical[-90:],
        "predicted": {
            "dates": result["dates"],
            "values": [round(v, 2) for v in result["values"]],
            "lower": [round(v, 2) for v in result["lower"]],
            "upper": [round(v, 2) for v in result["upper"]],
        },
        "confidence_score": round(confidence, 1),
        "decomposition": prediction.decomposition,
        "created_at": prediction.created_at.isoformat() if prediction.created_at else None,
    }
