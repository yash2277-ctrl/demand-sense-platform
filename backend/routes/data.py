from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import distinct
from database import get_db
from models import SalesData

router = APIRouter()


@router.get("/data/options")
async def get_data_options(db: Session = Depends(get_db)):
    products = [r[0] for r in db.query(distinct(SalesData.product)).all()]
    regions = [r[0] for r in db.query(distinct(SalesData.region)).all()]

    total_records = db.query(SalesData).count()
    date_range = None
    if total_records > 0:
        from sqlalchemy import func
        min_date = db.query(func.min(SalesData.date)).scalar()
        max_date = db.query(func.max(SalesData.date)).scalar()
        date_range = {
            "start": min_date.isoformat() if min_date else None,
            "end": max_date.isoformat() if max_date else None,
        }

    return {
        "products": sorted(products),
        "regions": sorted(regions),
        "total_records": total_records,
        "date_range": date_range,
    }
