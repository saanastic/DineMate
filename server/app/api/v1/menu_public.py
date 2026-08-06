from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services import menu_service

router = APIRouter()


@router.get("")
def get_menu(db: Session = Depends(get_db)):
    return menu_service.get_public_menu(db)
