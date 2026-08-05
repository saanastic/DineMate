from fastapi import APIRouter, Depends
from app.security.dependencies import require_active_user
from app.services.dashboard_service import get_dashboard_summary
from app.schemas.dashboard import DashboardPayload

router = APIRouter()


@router.get('/', response_model=DashboardPayload)
def get_dashboard(current_user=Depends(require_active_user)):
    return get_dashboard_summary(current_user)
