from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.security.dependencies import require_roles
from app.services import order_service

router = APIRouter()


@router.get("/")
def get_billing_overview(db: Session = Depends(get_db), _=Depends(require_roles("manager", "admin"))):
    # Return a simple list of recent orders as invoices for billing UI
    orders, total = order_service.list_orders(db, page=1, page_size=50)
    invoices = []
    for o in orders:
        od = order_service.order_to_dict(o)
        invoices.append({
            "id": od.get("id"),
            "total": od.get("total"),
            "status": od.get("payment_status"),
            "table_id": od.get("table_id"),
            "created_at": od.get("created_at"),
        })
    return {"invoices": invoices, "total": total}
