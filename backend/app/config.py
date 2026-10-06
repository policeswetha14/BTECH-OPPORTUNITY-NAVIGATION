from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_ROOT / ".env")


def database_path() -> Path:
    configured_path = os.getenv("BTECH_DATABASE_PATH", "data/btech-navigation.sqlite3")
    path = Path(configured_path)
    return path if path.is_absolute() else (BACKEND_ROOT / path).resolve()


def session_secret() -> bytes:
    value = os.getenv("BTECH_SESSION_SECRET", "")
    if len(value.encode("utf-8")) < 32:
        raise RuntimeError("BTECH_SESSION_SECRET must contain at least 32 bytes.")
    return value.encode("utf-8")


def cors_origins() -> list[str]:
    configured_origins = os.getenv(
        "BTECH_CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    )
    return [origin.strip() for origin in configured_origins.split(",") if origin.strip()]


def secure_cookies() -> bool:
    return os.getenv("BTECH_COOKIE_SECURE", "false").strip().casefold() == "true"
