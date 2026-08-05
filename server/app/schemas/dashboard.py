from pydantic import BaseModel
from typing import List

class SummaryBase(BaseModel):
    today_revenue: float
    today_orders: int
    active_tables: int
    reservations: int
    staff_on_shift: int
    customer_satisfaction: int

class TrendPoint(BaseModel):
    day: str
    orders: int
    revenue: float

class InsightItem(BaseModel):
    title: str
    description: str
    type: str

class DashboardUser(BaseModel):
    id: int
    email: str
    full_name: str | None
    role: str

class DashboardPayload(BaseModel):
    summary: SummaryBase
    trend: List[TrendPoint]
    insights: List[InsightItem]
    user: DashboardUser
