from __future__ import annotations

import sqlite3
import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlparse
from uuid import uuid4

from fastapi import Depends, FastAPI, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from app.config import cors_origins, secure_cookies, session_secret
from app.schemas import ApplicationStatusRequest, LoginRequest, Opportunity, SignupRequest, StudentProfile
from app.security import create_session_token, hash_password, hash_session_token, verify_password
from app.services.recommender import create_dashboard, evaluate_opportunity, explore_alternatives
from app.storage import (
    add_saved_opportunity,
    create_user,
    database,
    delete_session,
    get_opportunity,
    get_profile,
    get_session_user,
    get_user_by_email,
    get_user_by_id,
    initialize_database,
    list_applications,
    list_opportunities,
    list_saved_opportunities,
    remove_application,
    remove_saved_opportunity,
    save_application,
    save_profile,
    save_session,
    search_opportunities,
)

SESSION_COOKIE = "btech_session"
SESSION_DURATION_SECONDS = 60 * 60 * 12
REMEMBERED_SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30


@asynccontextmanager
async def lifespan(_: FastAPI):
    session_secret()
    initialize_database()
    yield


app = FastAPI(title="BTech Opportunity Navigation API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type"],
)


def authenticated_user(request: Request) -> dict[str, str]:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail="authentication required")
    with database() as connection:
        user = get_session_user(connection, hash_session_token(token))
    if user is None:
        raise HTTPException(status_code=401, detail="session expired or invalid")
    return {"id": user["id"], "email": user["email"]}


def set_session_cookie(
    response: Response,
    token: str,
    max_age: int,
) -> None:
    response.set_cookie(
        key=SESSION_COOKIE,
        value=token,
        max_age=max_age,
        httponly=True,
        secure=secure_cookies(),
        samesite="lax",
        path="/",
    )


def create_session_for_user(
    connection: sqlite3.Connection,
    user_id: str,
    response: Response,
    remember_me: bool,
) -> None:
    token = create_session_token()
    lifetime = REMEMBERED_SESSION_DURATION_SECONDS if remember_me else SESSION_DURATION_SECONDS
    save_session(connection, hash_session_token(token), user_id, int(time.time()) + lifetime)
    set_session_cookie(response, token, lifetime)


def verified_application_url(opportunity: Opportunity) -> tuple[str | None, str]:
    value = opportunity.application_url
    if not value:
        return None, "unavailable"
    validated_url = validated_http_url(value)
    if not validated_url:
        return None, "unavailable"
    if opportunity.verification_status.strip().casefold() == "verified":
        return validated_url, "verified"
    return validated_url, "unverified"


def validated_http_url(value: str | None) -> str | None:
    if not value:
        return None
    try:
        parsed = urlparse(value.strip())
        hostname = (parsed.hostname or "").lower().rstrip(".")
        valid_scheme = parsed.scheme.lower() in {"http", "https"}
        valid_host = bool(hostname) and parsed.username is None and parsed.password is None
        example_domain = hostname == "example.com" or hostname.endswith(".example.com")
        if not valid_scheme or not valid_host or example_domain:
            return None
    except ValueError:
        return None
    return value.strip()


def serialize_opportunity(opportunity: Opportunity) -> dict[str, Any]:
    result = opportunity.model_dump()
    result["application_url"], result["application_link_status"] = verified_application_url(opportunity)
    result["source_url"] = validated_http_url(result.get("source_url"))
    return result


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "btech-opportunity-navigation"}


@app.post("/api/auth/signup", status_code=201)
def signup(payload: SignupRequest, response: Response) -> dict[str, object]:
    profile_data = payload.model_dump(exclude={"email", "password"})
    profile = StudentProfile(**profile_data)
    user_id = str(uuid4())
    password_hash = hash_password(payload.password)
    try:
        with database() as connection:
            create_user(connection, user_id, payload.email, password_hash, profile)
            create_session_for_user(connection, user_id, response, remember_me=True)
    except sqlite3.IntegrityError as error:
        if "users.email" in str(error).lower():
            raise HTTPException(status_code=409, detail="An account with this email already exists.") from error
        raise
    return {"user": {"id": user_id, "email": payload.email}, "student": profile.model_dump()}


@app.post("/api/auth/login")
def login(payload: LoginRequest, response: Response) -> dict[str, object]:
    with database() as connection:
        user = get_user_by_email(connection, payload.email)
        if user is None or not verify_password(payload.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Email or password is incorrect.")
        create_session_for_user(connection, user["id"], response, payload.remember_me)
        profile = get_profile(connection, user["id"])
    return {"user": {"id": user["id"], "email": user["email"]}, "student": profile.model_dump()}


@app.post("/api/auth/logout")
def logout(request: Request, response: Response) -> dict[str, str]:
    token = request.cookies.get(SESSION_COOKIE)
    if token:
        with database() as connection:
            delete_session(connection, hash_session_token(token))
    response.delete_cookie(
        key=SESSION_COOKIE,
        httponly=True,
        secure=secure_cookies(),
        samesite="lax",
        path="/",
    )
    return {"status": "signed out"}


@app.get("/api/auth/me")
def get_current_account(user: dict[str, str] = Depends(authenticated_user)) -> dict[str, object]:
    with database() as connection:
        profile = get_profile(connection, user["id"])
    return {"user": user, "student": profile.model_dump()}


@app.get("/api/profile")
def get_student_profile(user: dict[str, str] = Depends(authenticated_user)) -> dict[str, object]:
    with database() as connection:
        profile = get_profile(connection, user["id"])
    return {"student": profile.model_dump(), "email": user["email"]}


@app.put("/api/profile")
def update_student_profile(
    payload: StudentProfile,
    user: dict[str, str] = Depends(authenticated_user),
) -> dict[str, object]:
    with database() as connection:
        save_profile(connection, user["id"], payload)
    return {"student": payload.model_dump()}


@app.get("/api/opportunities")
def list_opportunities_endpoint(
    q: str | None = Query(default=None, max_length=160),
    location: str | None = Query(default=None, max_length=100),
    skill: str | None = Query(default=None, max_length=100),
    category: str | None = Query(default=None, max_length=100),
    eligibility: str | None = Query(default=None, max_length=160),
) -> dict[str, object]:
    with database() as connection:
        opportunities = list_opportunities(connection)
    results = search_opportunities(opportunities, q, location, skill, category, eligibility)
    return {"opportunities": [serialize_opportunity(item) for item in results], "total": len(results)}


@app.get("/api/opportunities/{opportunity_id}")
def get_opportunity_endpoint(opportunity_id: str) -> dict[str, object]:
    with database() as connection:
        opportunity = get_opportunity(connection, opportunity_id)
    if opportunity is None:
        raise HTTPException(status_code=404, detail="opportunity not found")
    return {"opportunity": serialize_opportunity(opportunity)}


@app.get("/api/saved")
def get_saved_opportunities(user: dict[str, str] = Depends(authenticated_user)) -> dict[str, object]:
    with database() as connection:
        opportunities = list_saved_opportunities(connection, user["id"])
    return {"opportunities": [serialize_opportunity(item) for item in opportunities]}


@app.post("/api/saved/{opportunity_id}")
def save_opportunity(
    opportunity_id: str,
    user: dict[str, str] = Depends(authenticated_user),
) -> dict[str, object]:
    with database() as connection:
        if get_opportunity(connection, opportunity_id) is None:
            raise HTTPException(status_code=404, detail="opportunity not found")
        add_saved_opportunity(connection, user["id"], opportunity_id)
    return {"opportunity_id": opportunity_id, "saved": True}


@app.delete("/api/saved/{opportunity_id}")
def unsave_opportunity(
    opportunity_id: str,
    user: dict[str, str] = Depends(authenticated_user),
) -> dict[str, object]:
    with database() as connection:
        if get_opportunity(connection, opportunity_id) is None:
            raise HTTPException(status_code=404, detail="opportunity not found")
        remove_saved_opportunity(connection, user["id"], opportunity_id)
    return {"opportunity_id": opportunity_id, "saved": False}


@app.put("/api/applications/{opportunity_id}")
def update_application_status(
    opportunity_id: str,
    payload: ApplicationStatusRequest,
    user: dict[str, str] = Depends(authenticated_user),
) -> dict[str, object]:
    with database() as connection:
        if get_opportunity(connection, opportunity_id) is None:
            raise HTTPException(status_code=404, detail="opportunity not found")
        if payload.status == "not_tracked":
            remove_application(connection, user["id"], opportunity_id)
            return {"application": None}
        application = save_application(connection, user["id"], opportunity_id, payload.status)
    return {"application": application}


@app.get("/api/dashboard")
def get_dashboard(user: dict[str, str] = Depends(authenticated_user)) -> dict[str, object]:
    with database() as connection:
        profile = get_profile(connection, user["id"])
        opportunities = list_opportunities(connection)
        applications = list_applications(connection, user["id"])
    return create_dashboard(profile, opportunities, applications)


@app.get("/api/evaluate/{opportunity_id}")
def evaluate(
    opportunity_id: str,
    user: dict[str, str] = Depends(authenticated_user),
) -> dict[str, object]:
    with database() as connection:
        opportunity = get_opportunity(connection, opportunity_id)
        if opportunity is None:
            raise HTTPException(status_code=404, detail="opportunity not found")
        profile = get_profile(connection, user["id"])
        opportunities = list_opportunities(connection)
    return {
        "student": profile.model_dump(),
        "opportunity": serialize_opportunity(opportunity),
        "evaluation": evaluate_opportunity(profile, opportunity),
        "alternatives": explore_alternatives(profile, opportunity, opportunities),
    }


@app.get("/api/alternatives/{opportunity_id}")
def alternatives(
    opportunity_id: str,
    user: dict[str, str] = Depends(authenticated_user),
) -> dict[str, object]:
    with database() as connection:
        opportunity = get_opportunity(connection, opportunity_id)
        if opportunity is None:
            raise HTTPException(status_code=404, detail="opportunity not found")
        profile = get_profile(connection, user["id"])
        opportunities = list_opportunities(connection)
    return {"alternatives": explore_alternatives(profile, opportunity, opportunities)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
