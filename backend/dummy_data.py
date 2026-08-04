"""Generate realistic dummy sales data for DemandSense."""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import SalesData

PRODUCTS = ["Electronics", "Clothing", "Food & Beverage"]
REGIONS = ["North America", "Europe", "Asia Pacific"]

BASE_DEMAND = {
    "Electronics": 1200,
    "Clothing": 800,
    "Food & Beverage": 1500,
}

SEASONALITY = {
    "Electronics": {"amplitude": 400, "peak_month": 12},
    "Clothing": {"amplitude": 300, "peak_month": 6},
    "Food & Beverage": {"amplitude": 200, "peak_month": 7},
}

REGION_MULTIPLIER = {
    "North America": 1.0,
    "Europe": 0.85,
    "Asia Pacific": 1.15,
}


def generate_dummy_data(db: Session):
    """Generate 2 years of daily sales data for 3 products x 3 regions."""
    existing = db.query(SalesData).first()
    if existing:
        return False

    end_date = datetime(2026, 2, 23)
    start_date = end_date - timedelta(days=730)
    dates = pd.date_range(start=start_date, end=end_date, freq="D")
    records = []

    np.random.seed(42)

    for product in PRODUCTS:
        base = BASE_DEMAND[product]
        seas = SEASONALITY[product]
        for region in REGIONS:
            mult = REGION_MULTIPLIER[region]
            for i, date in enumerate(dates):
                month_frac = (date.month - 1 + date.day / 30.0) / 12.0
                seasonal = seas["amplitude"] * np.sin(
                    2 * np.pi * (month_frac - (seas["peak_month"] - 3) / 12.0)
                )
                trend = i * 0.15
                weekly = 50 * np.sin(2 * np.pi * date.dayofweek / 7)
                noise = np.random.normal(0, base * 0.05)
                demand = max(10, (base + seasonal + trend + weekly + noise) * mult)
                records.append(
                    SalesData(
                        date=date.to_pydatetime(),
                        product=product,
                        region=region,
                        demand=round(demand, 2),
                    )
                )

    db.bulk_save_objects(records)
    db.commit()
    return True
