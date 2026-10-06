from __future__ import annotations

import re
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class StudentProfile(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    branch: str = Field(min_length=1, max_length=100)
    year: int = Field(ge=1, le=4)
    semester: int = Field(ge=1, le=8)
    cgpa: float = Field(ge=0, le=10)
    skills: list[str] = Field(default_factory=list, max_length=50)
    interests: list[str] = Field(default_factory=list)
    preferred_opportunity_types: list[str] = Field(default_factory=list)
    location: str = Field(default="Hyderabad", max_length=100)
    mode: str = Field(default="Remote", max_length=30)
    career_goal: str = Field(default="Software Engineer", max_length=120)

    @field_validator("name", "branch", "location", "mode", "career_goal")
    @classmethod
    def trim_profile_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank.")
        return value

    @field_validator("skills", "interests", "preferred_opportunity_types")
    @classmethod
    def normalize_profile_lists(cls, values: list[str]) -> list[str]:
        cleaned = [value.strip() for value in values if value.strip()]
        if len({value.casefold() for value in cleaned}) != len(cleaned):
            raise ValueError("List entries must be unique.")
        return cleaned


class Opportunity(BaseModel):
    id: str
    title: str
    organization: str
    category: str
    description: str
    requirements: str
    eligibility: str
    required_skills: list[str] = Field(default_factory=list)
    preferred_skills: list[str] = Field(default_factory=list)
    branch_requirements: list[str] = Field(default_factory=list)
    academic_year_requirements: list[str] = Field(default_factory=list)
    cgpa_requirement: float | None = None
    location: str
    mode: str
    stipend: str | None = None
    salary: str | None = None
    application_url: str | None = None
    source_url: str | None = None
    posted_date: str
    deadline: str
    status: str
    verification_status: str
    last_verified_at: str
    created_at: str
    updated_at: str


class OpportunityRecommendation(BaseModel):
    opportunity_id: str
    title: str
    organization: str
    category: str
    match_score: int
    eligibility_status: str
    reasons: list[str]
    missing_skills: list[str]
    priority_skills: list[str]
    deadline: str
    verification_status: str


class SignupRequest(StudentProfile):
    email: str = Field(min_length=6, max_length=254)
    password: str = Field(min_length=10, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        email = value.strip().lower()
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
            raise ValueError("Enter a valid email address.")
        return email


class LoginRequest(BaseModel):
    email: str = Field(min_length=6, max_length=254)
    password: str = Field(min_length=1, max_length=128)
    remember_me: bool = False

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        email = value.strip().lower()
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
            raise ValueError("Enter a valid email address.")
        return email


class ApplicationStatusRequest(BaseModel):
    status: Literal["not_tracked", "applied", "assessment", "interview", "offered", "rejected"]
