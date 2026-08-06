from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db
from app.services import menu_service

router = APIRouter()


@router.get("/{qr_code}")
def get_table_by_qr(qr_code: str, db: Session = Depends(get_db)):
    table = menu_service.get_table_by_qr(db, qr_code)
    if not table or not table.is_active:
        raise HTTPException(status_code=404, detail="Table not found or inactive")
    return {
        "id": table.id,
        "label": table.label,
        "qr_code": table.qr_code,
        "restaurant_name": settings.RESTAURANT_NAME,
    }
