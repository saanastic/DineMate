from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.order_service import list_orders, order_to_dict
from app.security.dependencies import require_active_user

router = APIRouter()


@router.get("/")
def get_kitchen_queue(db: Session = Depends(get_db), current_user=Depends(require_active_user)):
    try:
        # Fetch recent open orders for kitchen display
        orders, _ = list_orders(db, page=1, page_size=50)
        payload = [order_to_dict(o) for o in orders]
        # Return a plain list for easier frontend consumption
        return payload
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
