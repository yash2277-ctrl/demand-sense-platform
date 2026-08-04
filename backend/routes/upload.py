from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import SalesData
import pandas as pd
import io

router = APIRouter()


@router.post("/upload")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        return {"error": "Only CSV files are accepted"}

    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        return {"error": f"Failed to parse CSV: {str(e)}"}

    required_cols = {"date", "product", "region", "demand"}
    actual_cols = set(c.lower().strip() for c in df.columns)
    if not required_cols.issubset(actual_cols):
        return {
            "error": f"Missing required columns. Expected: {required_cols}. Got: {set(df.columns.tolist())}"
        }

    df.columns = [c.lower().strip() for c in df.columns]
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["date", "demand"])
    df = df.drop_duplicates(subset=["date", "product", "region"])
    df = df.sort_values("date")

    records = []
    for _, row in df.iterrows():
        records.append(
            SalesData(
                date=row["date"].to_pydatetime(),
                product=str(row["product"]).strip(),
                region=str(row["region"]).strip(),
                demand=float(row["demand"]),
            )
        )

    db.bulk_save_objects(records)
    db.commit()

    return {
        "success": True,
        "rows_uploaded": len(records),
        "unique_products": df["product"].nunique(),
        "unique_regions": df["region"].nunique(),
        "date_range": {
            "start": df["date"].min().isoformat(),
            "end": df["date"].max().isoformat(),
        },
    }
