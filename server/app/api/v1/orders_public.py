from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.dining import AddItemsInput, OrderCreate, PaymentIntentOut
from app.services import order_service
from app.utils.ws_manager import ws_manager

router = APIRouter()


@router.post("")
async def place_order(data: OrderCreate, db: Session = Depends(get_db)):
    try:
        order = order_service.create_order(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    payload = order_service.order_to_dict(order)
    await ws_manager.notify_admin("new_order", {"id": order.id, "table_id": order.table_id, "status": payload["status"], "total": payload["total"]})

    alerts = getattr(order, "_stock_alerts", [])
    for alert in alerts:
        await ws_manager.notify_admin("low_stock", alert)

    return payload


@router.get("/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = order_service.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order_service.order_to_dict(order)


@router.post("/{order_id}/pay", response_model=PaymentIntentOut)
def pay_order(order_id: int, db: Session = Depends(get_db)):
    try:
        client_secret, pi_id = order_service.create_stripe_payment_intent(db, order_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return PaymentIntentOut(client_secret=client_secret, payment_intent_id=pi_id)


@router.patch("/{order_id}/add-items")
async def add_items(order_id: int, data: AddItemsInput, db: Session = Depends(get_db)):
    try:
        order = order_service.add_items_to_order(db, order_id, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    payload = order_service.order_to_dict(order)
    await ws_manager.notify_admin("order_updated", {"id": order.id, "total": payload["total"]})
    await ws_manager.notify_table(order.table_id, "order_updated", {"id": order.id, "status": payload["status"], "total": payload["total"]})

    for alert in getattr(order, "_stock_alerts", []):
        await ws_manager.notify_admin("low_stock", alert)

    return payload
