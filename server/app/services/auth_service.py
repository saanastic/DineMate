from sqlalchemy.orm import Session
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.schemas.user import UserCreate
from app.security.auth import get_password_hash, verify_password, create_access_token
from datetime import timedelta, datetime
from app.core.config import settings
import uuid


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user_in: UserCreate):
    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role='waiter'
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def _create_refresh_token_entry(db: Session, user: User, token_str: str, expires_at: datetime):
    rt = RefreshToken(token=token_str, user_id=user.id, expires_at=expires_at)
    db.add(rt)
    db.commit()
    db.refresh(rt)
    return rt


def create_refresh_token(db: Session, user: User):
    token_str = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return _create_refresh_token_entry(db, user, token_str, expires_at)


def revoke_refresh_token(db: Session, token_str: str):
    rt = db.query(RefreshToken).filter(RefreshToken.token == token_str).first()
    if not rt:
        return False
    rt.revoked = True
    db.add(rt)
    db.commit()
    return True


def create_token(db: Session, user: User):
    data = {"sub": user.email, "role": user.role}
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data=data, expires_delta=access_token_expires)
    # create refresh token entry
    rt = create_refresh_token(db, user)
    return {"access_token": access_token, "token_type": "bearer", "refresh_token": rt.token}


def refresh_access_token(db: Session, refresh_token_str: str):
    rt = db.query(RefreshToken).filter(RefreshToken.token == refresh_token_str).first()
    if not rt or rt.revoked:
        return None
    if rt.expires_at < datetime.utcnow():
        return None
    user = db.query(User).filter(User.id == rt.user_id).first()
    if not user:
        return None
    # optionally rotate refresh tokens: revoke old and create a new one
    revoke_refresh_token(db, refresh_token_str)
    new_rt = create_refresh_token(db, user)
    data = {"sub": user.email, "role": user.role}
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data=data, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer", "refresh_token": new_rt.token}
