DineMate AI — FastAPI Backend

This directory contains a scaffolded FastAPI backend for the DineMate AI platform.

Quickstart (development using docker-compose):

1. Copy .env.example to .env and fill secrets.
2. Build and start services:
   docker-compose up --build
3. Apply migrations (inside backend container or locally with alembic):
   docker-compose exec backend alembic upgrade head

Available services:
- PostgreSQL (db)
- Redis (redis)
- Backend (FastAPI)

Notes:
- The existing Node-based server was renamed to server_node_backup_20260804 for safety.
- This scaffold includes authentication endpoints (signup, login, refresh, logout, forgot-password, reset-password) and an initial Alembic migration.
- For production, secure SECRET_KEY, configure HTTPS, and use a proper mailer for password resets.
