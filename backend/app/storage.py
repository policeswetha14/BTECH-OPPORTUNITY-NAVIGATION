from __future__ import annotations

import json
import re
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterator

from app.config import database_path
from app.data.sample_data import OPPORTUNITIES
from app.schemas import Opportunity, StudentProfile

OPPORTUNITY_LIST_FIELDS = (
    "required_skills",
    "preferred_skills",
    "branch_requirements",
    "academic_year_requirements",
)


def connect_database(path: Path | None = None) -> sqlite3.Connection:
    db_path = path or database_path()
    db_path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(db_path, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    connection.execute("PRAGMA busy_timeout = 10000")
    return connection


@contextmanager
def database(path: Path | None = None) -> Iterator[sqlite3.Connection]:
    connection = connect_database(path)
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def initialize_database(path: Path | None = None) -> None:
    with database(path) as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS student_profiles (
                user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                branch TEXT NOT NULL,
                year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 8),
                semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 16),
                cgpa REAL NOT NULL CHECK (cgpa BETWEEN 0 AND 10),
                skills_json TEXT NOT NULL,
                interests_json TEXT NOT NULL,
                preferred_opportunity_types_json TEXT NOT NULL,
                location TEXT NOT NULL,
                mode TEXT NOT NULL,
                career_goal TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS opportunities (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                organization TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT NOT NULL,
                requirements TEXT NOT NULL,
                eligibility TEXT NOT NULL,
                required_skills_json TEXT NOT NULL,
                preferred_skills_json TEXT NOT NULL,
                branch_requirements_json TEXT NOT NULL,
                academic_year_requirements_json TEXT NOT NULL,
                cgpa_requirement REAL,
                location TEXT NOT NULL,
                mode TEXT NOT NULL,
                stipend TEXT,
                salary TEXT,
                application_url TEXT,
                source_url TEXT,
                posted_date TEXT NOT NULL,
                deadline TEXT NOT NULL,
                status TEXT NOT NULL,
                verification_status TEXT NOT NULL,
                last_verified_at TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS sessions (
                token_hash TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                expires_at INTEGER NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
            CREATE TABLE IF NOT EXISTS saved_opportunities (
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                opportunity_id TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
                saved_at TEXT NOT NULL,
                PRIMARY KEY (user_id, opportunity_id)
            );

            CREATE TABLE IF NOT EXISTS applications (
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                opportunity_id TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
                status TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                PRIMARY KEY (user_id, opportunity_id)
            );
            """
        )
        for opportunity in OPPORTUNITIES:
            data = opportunity.model_dump()
            columns = [
                "id", "title", "organization", "category", "description", "requirements",
                "eligibility", "required_skills_json", "preferred_skills_json",
                "branch_requirements_json", "academic_year_requirements_json",
                "cgpa_requirement", "location", "mode", "stipend", "salary",
                "application_url", "source_url", "posted_date", "deadline",
                "status", "verification_status", "last_verified_at", "created_at", "updated_at",
            ]
            values = []
            for column in columns:
                key = column.removesuffix("_json")
                value = data.get(key)
                values.append(json.dumps(value) if column.endswith("_json") else value)
            placeholders = ", ".join("?" for _ in columns)
            connection.execute(
                f"INSERT OR IGNORE INTO opportunities ({', '.join(columns)}) VALUES ({placeholders})",
                values,
            )


def create_user(
    connection: sqlite3.Connection,
    user_id: str,
    email: str,
    password_hash: str,
    profile: StudentProfile,
) -> None:
    now = datetime.now(timezone.utc).isoformat()
    connection.execute(
        "INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
        (user_id, email.strip().lower(), password_hash, now),
    )
    save_profile(connection, user_id, profile)


def save_profile(connection: sqlite3.Connection, user_id: str, profile: StudentProfile) -> None:
    now = datetime.now(timezone.utc).isoformat()
    connection.execute(
        """
        INSERT INTO student_profiles (
            user_id, name, branch, year, semester, cgpa, skills_json,
            interests_json, preferred_opportunity_types_json, location, mode,
            career_goal, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
            name = excluded.name,
            branch = excluded.branch,
            year = excluded.year,
            semester = excluded.semester,
            cgpa = excluded.cgpa,
            skills_json = excluded.skills_json,
            interests_json = excluded.interests_json,
            preferred_opportunity_types_json = excluded.preferred_opportunity_types_json,
            location = excluded.location,
            mode = excluded.mode,
            career_goal = excluded.career_goal,
            updated_at = excluded.updated_at
        """,
        (
            user_id,
            profile.name,
            profile.branch,
            profile.year,
            profile.semester,
            profile.cgpa,
            json.dumps(profile.skills),
            json.dumps(profile.interests),
            json.dumps(profile.preferred_opportunity_types),
            profile.location,
            profile.mode,
            profile.career_goal,
            now,
        ),
    )


def get_profile(connection: sqlite3.Connection, user_id: str) -> StudentProfile:
    row = connection.execute(
        "SELECT * FROM student_profiles WHERE user_id = ?",
        (user_id,),
    ).fetchone()
    if row is None:
        raise LookupError("student profile not found")
    return StudentProfile(
        name=row["name"],
        branch=row["branch"],
        year=row["year"],
        semester=row["semester"],
        cgpa=row["cgpa"],
        skills=json.loads(row["skills_json"]),
        interests=json.loads(row["interests_json"]),
        preferred_opportunity_types=json.loads(row["preferred_opportunity_types_json"]),
        location=row["location"],
        mode=row["mode"],
        career_goal=row["career_goal"],
    )


def get_user_by_email(connection: sqlite3.Connection, email: str) -> sqlite3.Row | None:
    return connection.execute(
        "SELECT id, email, password_hash FROM users WHERE email = ? COLLATE NOCASE",
        (email.strip().lower(),),
    ).fetchone()


def get_user_by_id(connection: sqlite3.Connection, user_id: str) -> sqlite3.Row | None:
    return connection.execute(
        "SELECT id, email FROM users WHERE id = ?",
        (user_id,),
    ).fetchone()


def save_session(connection: sqlite3.Connection, token_hash: str, user_id: str, expires_at: int) -> None:
    connection.execute("DELETE FROM sessions WHERE expires_at <= ?", (int(datetime.now().timestamp()),))
    connection.execute(
        "INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
        (token_hash, user_id, expires_at, datetime.now(timezone.utc).isoformat()),
    )


def get_session_user(connection: sqlite3.Connection, token_hash: str) -> sqlite3.Row | None:
    return connection.execute(
        """
        SELECT users.id, users.email
        FROM sessions
        JOIN users ON users.id = sessions.user_id
        WHERE sessions.token_hash = ? AND sessions.expires_at > ?
        """,
        (token_hash, int(datetime.now().timestamp())),
    ).fetchone()


def delete_session(connection: sqlite3.Connection, token_hash: str) -> None:
    connection.execute("DELETE FROM sessions WHERE token_hash = ?", (token_hash,))


def list_opportunities(connection: sqlite3.Connection) -> list[Opportunity]:
    rows = connection.execute("SELECT * FROM opportunities ORDER BY deadline, title").fetchall()
    return [opportunity_from_row(row) for row in rows]


def get_opportunity(connection: sqlite3.Connection, opportunity_id: str) -> Opportunity | None:
    row = connection.execute(
        "SELECT * FROM opportunities WHERE id = ?",
        (opportunity_id,),
    ).fetchone()
    return opportunity_from_row(row) if row else None


def opportunity_from_row(row: sqlite3.Row) -> Opportunity:
    values: dict[str, Any] = dict(row)
    for field in OPPORTUNITY_LIST_FIELDS:
        values[field] = json.loads(values.pop(f"{field}_json"))
    return Opportunity(**values)


def search_opportunities(
    opportunities: list[Opportunity],
    query: str | None = None,
    location: str | None = None,
    skill: str | None = None,
    category: str | None = None,
    eligibility: str | None = None,
) -> list[Opportunity]:
    def tokenize(value: str) -> list[str]:
        return re.findall(r"[a-z0-9]+", value.casefold())

    terms = tokenize(query or "")
    found: list[Opportunity] = []
    for opportunity in opportunities:
        searchable_words = tokenize(" ".join(
            [
                opportunity.title,
                opportunity.organization,
                opportunity.category,
                opportunity.location,
                opportunity.eligibility,
                opportunity.description,
                opportunity.requirements,
                *opportunity.required_skills,
                *opportunity.preferred_skills,
                *opportunity.branch_requirements,
                *opportunity.academic_year_requirements,
            ]
        ))
        if terms and not all(
            any(term in word for word in searchable_words)
            for term in terms
        ):
            continue
        if location and location.casefold() not in opportunity.location.casefold():
            continue
        if skill and not any(
            skill.casefold() in item.casefold()
            for item in (*opportunity.required_skills, *opportunity.preferred_skills)
        ):
            continue
        if category and category.casefold() not in opportunity.category.casefold():
            continue
        if eligibility and eligibility.casefold() not in opportunity.eligibility.casefold():
            continue
        found.append(opportunity)
    return found


def add_saved_opportunity(connection: sqlite3.Connection, user_id: str, opportunity_id: str) -> bool:
    cursor = connection.execute(
        "INSERT OR IGNORE INTO saved_opportunities (user_id, opportunity_id, saved_at) VALUES (?, ?, ?)",
        (user_id, opportunity_id, datetime.now(timezone.utc).isoformat()),
    )
    return cursor.rowcount > 0


def remove_saved_opportunity(connection: sqlite3.Connection, user_id: str, opportunity_id: str) -> bool:
    cursor = connection.execute(
        "DELETE FROM saved_opportunities WHERE user_id = ? AND opportunity_id = ?",
        (user_id, opportunity_id),
    )
    return cursor.rowcount > 0


def list_saved_opportunities(connection: sqlite3.Connection, user_id: str) -> list[Opportunity]:
    rows = connection.execute(
        """
        SELECT opportunities.*
        FROM saved_opportunities
        JOIN opportunities ON opportunities.id = saved_opportunities.opportunity_id
        WHERE saved_opportunities.user_id = ?
        ORDER BY saved_opportunities.saved_at DESC
        """,
        (user_id,),
    ).fetchall()
    return [opportunity_from_row(row) for row in rows]


def list_applications(connection: sqlite3.Connection, user_id: str) -> list[dict[str, str]]:
    rows = connection.execute(
        """
        SELECT opportunities.id AS opportunity_id, opportunities.title, applications.status, applications.updated_at
        FROM applications
        JOIN opportunities ON opportunities.id = applications.opportunity_id
        WHERE applications.user_id = ?
        ORDER BY applications.updated_at DESC
        """,
        (user_id,),
    ).fetchall()
    return [dict(row) for row in rows]


def save_application(
    connection: sqlite3.Connection,
    user_id: str,
    opportunity_id: str,
    status: str,
) -> dict[str, str]:
    updated_at = datetime.now(timezone.utc).isoformat()
    connection.execute(
        """
        INSERT INTO applications (user_id, opportunity_id, status, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, opportunity_id) DO UPDATE SET
            status = excluded.status,
            updated_at = excluded.updated_at
        """,
        (user_id, opportunity_id, status, updated_at),
    )
    row = connection.execute(
        """
        SELECT opportunities.id AS opportunity_id, opportunities.title, applications.status, applications.updated_at
        FROM applications
        JOIN opportunities ON opportunities.id = applications.opportunity_id
        WHERE applications.user_id = ? AND applications.opportunity_id = ?
        """,
        (user_id, opportunity_id),
    ).fetchone()
    if row is None:
        raise LookupError("application record could not be retrieved after saving")
    return dict(row)


def remove_application(connection: sqlite3.Connection, user_id: str, opportunity_id: str) -> bool:
    cursor = connection.execute(
        "DELETE FROM applications WHERE user_id = ? AND opportunity_id = ?",
        (user_id, opportunity_id),
    )
    return cursor.rowcount > 0
