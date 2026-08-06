from fastapi.testclient import TestClient

from app.database.session import SessionLocal
from app.main import app
from app.models.user import User
from app.security.auth import get_password_hash


client = TestClient(app)


def test_admin_login_alias_returns_token():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "admin@example.com").first()
        if not user:
            user = User(
                email="admin@example.com",
                full_name="Admin",
                hashed_password=get_password_hash("admin123"),
                role="admin",
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        response = client.post(
            "/api/v1/admin/login",
            json={"email": "admin@example.com", "password": "admin123"},
        )
        assert response.status_code == 200
        payload = response.json()
        assert payload["access_token"]
        assert payload["refresh_token"]
    finally:
        db.close()
