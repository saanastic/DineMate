from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserOut, Token
from app.database.session import get_db
from app.models.user import User
from app.services import auth_service
from app.security.auth import get_password_hash
from app.security.dependencies import require_active_user
from app.utils.cache import get_redis
import uuid

router = APIRouter()


@router.post('/signup', response_model=UserOut)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    user = auth_service.get_user_by_email(db, user_in.email)
    if user:
        raise HTTPException(status_code=400, detail='Email already registered')
    created = auth_service.create_user(db, user_in)
    return created


@router.post('/login', response_model=Token)
def login(payload: dict = Body(...), db: Session = Depends(get_db)):
    email = payload.get('email')
    password = payload.get('password')
    if not email or not password:
        raise HTTPException(status_code=400, detail='Email and password required')
    user = auth_service.authenticate_user(db, email, password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')
    token = auth_service.create_token(db, user)
    return token


@router.post('/refresh', response_model=Token)
def refresh(body: dict = Body(...), db: Session = Depends(get_db)):
    refresh_token = body.get('refresh_token')
    if not refresh_token:
        raise HTTPException(status_code=400, detail='refresh_token is required')
    new = auth_service.refresh_access_token(db, refresh_token)
    if not new:
        raise HTTPException(status_code=401, detail='Invalid or expired refresh token')
    return new


@router.post('/logout')
def logout(body: dict = Body(...), db: Session = Depends(get_db)):
    refresh_token = body.get('refresh_token')
    if not refresh_token:
        raise HTTPException(status_code=400, detail='refresh_token is required')
    ok = auth_service.revoke_refresh_token(db, refresh_token)
    if not ok:
        raise HTTPException(status_code=404, detail='Refresh token not found')
    return {"message": "Logged out"}


@router.post('/forgot-password')
def forgot_password(body: dict = Body(...), db: Session = Depends(get_db)):
    email = body.get('email')
    if not email:
        raise HTTPException(status_code=400, detail='email is required')
    user = auth_service.get_user_by_email(db, email)
    if not user:
        # Don't reveal whether email exists
        return {"message": "If the email exists, a reset link has been sent."}
    token = str(uuid.uuid4())
    r = get_redis()
    # store mapping token -> user_id for 1 hour
    r.setex(f"pwdreset:{token}", 3600, str(user.id))
    # In production, send email with link containing token
    return {"message": "Password reset token generated", "reset_token": token}


@router.post('/reset-password')
def reset_password(body: dict = Body(...), db: Session = Depends(get_db)):
    token = body.get('token')
    new_password = body.get('password')
    if not token or not new_password:
        raise HTTPException(status_code=400, detail='token and password are required')
    r = get_redis()
    user_id = r.get(f"pwdreset:{token}")
    if not user_id:
        raise HTTPException(status_code=400, detail='Invalid or expired token')
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=400, detail='User not found')
    user.hashed_password = get_password_hash(new_password)
    db.add(user)
    db.commit()
    r.delete(f"pwdreset:{token}")
    return {"message": "Password updated"}


@router.get('/me', response_model=UserOut)
def read_current_user(current_user: User = Depends(require_active_user)):
    return current_user
