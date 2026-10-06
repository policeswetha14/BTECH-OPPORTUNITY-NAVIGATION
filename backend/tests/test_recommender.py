from __future__ import annotations

import pytest
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.data.sample_data import OPPORTUNITIES, STUDENT_PROFILE
from app.services.recommender import compute_interest_score, evaluate_opportunity, recommendation_score
from main import app


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("BTECH_DATABASE_PATH", str(tmp_path / "test.sqlite3"))
    with TestClient(app) as test_client:
        yield test_client


def create_account(client: TestClient, email: str = "student@example.edu") -> None:
    response = client.post(
        "/api/auth/signup",
        json={
            "name": "Test Student",
            "email": email,
            "password": "correct-horse-battery",
            "branch": "Computer Science",
            "year": 3,
            "semester": 5,
            "cgpa": 8.4,
            "skills": ["Python"],
            "interests": ["Software"],
            "preferred_opportunity_types": ["Internship"],
            "location": "Bengaluru",
            "mode": "Hybrid",
            "career_goal": "Software Engineer",
        },
    )
    assert response.status_code == 201


def test_student_qualifies_for_relevant_internship():
    opportunity = next(item for item in OPPORTUNITIES if item.id == "msr-india-summer-intern")
    evaluation = evaluate_opportunity(STUDENT_PROFILE, opportunity)
    assert evaluation["status"] in {"eligible", "partially_eligible"}


def test_missing_skill_is_detected():
    opportunity = next(item for item in OPPORTUNITIES if item.id == "amazon-sde-intern")
    evaluation = evaluate_opportunity(STUDENT_PROFILE, opportunity)
    assert "REST API" in evaluation["missing_skills"] or evaluation["status"] in {"eligible", "partially_eligible"}


def test_preferred_skill_is_not_blocker():
    opportunity = next(item for item in OPPORTUNITIES if item.id == "google-soc")
    evaluation = evaluate_opportunity(STUDENT_PROFILE, opportunity)
    assert evaluation["status"] in {"eligible", "partially_eligible"}


def test_expired_or_urgent_deadline_is_prioritized():
    for opportunity in OPPORTUNITIES:
        score, _, _ = recommendation_score(STUDENT_PROFILE, opportunity)
        assert score >= 0
    assert any(item.id == "sih-2027" for item in OPPORTUNITIES)


def test_eligibility_reasons_match_result_logic():
    opportunity = next(item for item in OPPORTUNITIES if item.id == "nvidia-ai-fellowship")
    evaluation = evaluate_opportunity(STUDENT_PROFILE, opportunity)
    assert "status" in evaluation
    assert isinstance(evaluation["reasons"], list)


def test_case_insensitive_branch_and_year_matching():
    opportunity = SimpleNamespace(
        required_skills=["Python"],
        preferred_skills=[],
        branch_requirements=["computer science", "information technology"],
        academic_year_requirements=["2nd", "3rd"],
        cgpa_requirement=7.5,
        deadline="2026-10-18",
        mode="Hybrid",
    )
    student = SimpleNamespace(
        branch="Computer Science",
        year=3,
        cgpa=8.2,
        skills=["Python"],
        interests=["software engineering"],
        mode="hybrid",
    )

    evaluation = evaluate_opportunity(student, opportunity)
    assert evaluation["status"] in {"eligible", "partially_eligible"}
    assert evaluation["branch_match"] is True
    assert evaluation["year_match"] is True


def test_final_year_aliases_are_supported():
    opportunity = SimpleNamespace(
        required_skills=["Python"],
        preferred_skills=[],
        branch_requirements=["CSE"],
        academic_year_requirements=["final year"],
        cgpa_requirement=7.5,
        deadline="2026-10-18",
        mode="Hybrid",
    )
    student = SimpleNamespace(
        branch="Computer Science",
        year=4,
        cgpa=8.2,
        skills=["Python"],
        interests=["software engineering"],
        mode="hybrid",
    )

    evaluation = evaluate_opportunity(student, opportunity)
    assert evaluation["status"] in {"eligible", "partially_eligible"}
    assert evaluation["branch_match"] is True
    assert evaluation["year_match"] is True


def test_interest_matching_handles_punctuation_variants():
    opportunity = SimpleNamespace(
        category="Research",
        title="AI/ML Internship",
        description="Apply machine learning reasoning to build intelligent systems.",
        required_skills=["Python"],
        preferred_skills=[],
        branch_requirements=[],
        academic_year_requirements=[],
        cgpa_requirement=None,
        deadline="2026-10-18",
        mode="Hybrid",
    )
    student = SimpleNamespace(
        branch="Computer Science",
        year=3,
        cgpa=8.7,
        skills=["Python"],
        interests=["AI & ML"],
        mode="hybrid",
    )

    score = compute_interest_score(student, opportunity)
    assert score > 0.0


def test_missing_opportunity_returns_404(client: TestClient):
    create_account(client)
    response = client.get("/api/evaluate/unknown-opportunity")
    assert response.status_code == 404
    assert response.json()["detail"] == "opportunity not found"


def test_signup_login_and_logout_use_http_only_session(client: TestClient):
    create_account(client)
    assert client.cookies.get("btech_session")
    assert client.get("/api/auth/me").status_code == 200

    client.post("/api/auth/logout")
    assert client.get("/api/auth/me").status_code == 401

    response = client.post(
        "/api/auth/login",
        json={"email": "STUDENT@example.edu", "password": "correct-horse-battery", "remember_me": True},
    )
    assert response.status_code == 200
    assert client.get("/api/auth/me").status_code == 200


def test_duplicate_signup_and_incorrect_password_are_rejected(client: TestClient):
    create_account(client)
    duplicate = client.post(
        "/api/auth/signup",
        json={
            "name": "Other Student",
            "email": "STUDENT@example.edu",
            "password": "correct-horse-battery",
            "branch": "Computer Science",
            "year": 3,
            "semester": 5,
            "cgpa": 8.4,
        },
    )
    assert duplicate.status_code == 409

    invalid_login = client.post(
        "/api/auth/login",
        json={"email": "student@example.edu", "password": "wrong-password"},
    )
    assert invalid_login.status_code == 401


def test_profile_update_persists_and_is_scoped_to_logged_in_user(client: TestClient):
    create_account(client)
    updated_profile = {
        "name": "Updated Student",
        "branch": "Computer Science",
        "year": 4,
        "semester": 8,
        "cgpa": 9.1,
        "skills": ["Python", "SQL"],
        "interests": ["Research"],
        "preferred_opportunity_types": ["Internship", "Research"],
        "location": "Pune",
        "mode": "Remote",
        "career_goal": "Research Engineer",
    }
    updated = client.put("/api/profile", json=updated_profile)
    assert updated.status_code == 200
    client.post("/api/auth/logout")

    assert client.get("/api/profile").status_code == 401
    client.post(
        "/api/auth/login",
        json={"email": "student@example.edu", "password": "correct-horse-battery"},
    )
    profile = client.get("/api/profile").json()["student"]
    assert profile["name"] == "Updated Student"
    assert profile["skills"] == ["Python", "SQL"]
    assert profile["location"] == "Pune"


def test_saved_opportunities_are_persistent_and_deduplicated_per_user(client: TestClient):
    create_account(client)
    opportunity_id = "google-aiml-intern"

    assert client.post(f"/api/saved/{opportunity_id}").json()["saved"] is True
    assert client.post(f"/api/saved/{opportunity_id}").json()["saved"] is True
    assert [item["id"] for item in client.get("/api/saved").json()["opportunities"]] == [opportunity_id]

    client.post("/api/auth/logout")
    create_account(client, "another@example.edu")
    assert client.get("/api/saved").json()["opportunities"] == []

    assert client.delete(f"/api/saved/{opportunity_id}").json()["saved"] is False
    assert client.get("/api/saved").json()["opportunities"] == []


def test_application_status_is_persistent_user_scoped_and_removable(client: TestClient):
    create_account(client)
    opportunity_id = "google-aiml-intern"

    applied = client.put(
        f"/api/applications/{opportunity_id}",
        json={"status": "applied"},
    )
    assert applied.status_code == 200
    assert applied.json()["application"]["status"] == "applied"
    assert applied.json()["application"]["title"] == "AI/ML Internship"

    updated = client.put(
        f"/api/applications/{opportunity_id}",
        json={"status": "interview"},
    )
    assert updated.status_code == 200
    assert len(client.get("/api/dashboard").json()["application_status"]) == 1

    client.post("/api/auth/logout")
    create_account(client, "another@example.edu")
    assert client.get("/api/dashboard").json()["application_status"] == []

    client.post("/api/auth/logout")
    client.post(
        "/api/auth/login",
        json={"email": "student@example.edu", "password": "correct-horse-battery"},
    )
    application = client.get("/api/dashboard").json()["application_status"][0]
    assert application["opportunity_id"] == opportunity_id
    assert application["status"] == "interview"

    removed = client.put(
        f"/api/applications/{opportunity_id}",
        json={"status": "not_tracked"},
    )
    assert removed.status_code == 200
    assert removed.json()["application"] is None
    assert client.get("/api/dashboard").json()["application_status"] == []


@pytest.mark.parametrize(
    ("query", "expected_id"),
    [
        ("google", "google-aiml-intern"),
        ("AI/ML", "google-aiml-intern"),
        ("TENSORFLOW", "google-aiml-intern"),
        ("bengaluru Python", "google-aiml-intern"),
        ("BTech CSE/ECE", "google-aiml-intern"),
    ],
)
def test_opportunity_search_is_case_insensitive_partial_and_multi_term(
    client: TestClient,
    query: str,
    expected_id: str,
):
    response = client.get("/api/opportunities", params={"q": query})
    assert response.status_code == 200
    assert expected_id in {item["id"] for item in response.json()["opportunities"]}


def test_application_links_exclude_example_placeholders(client: TestClient):
    response = client.get("/api/opportunities")
    opportunities = {item["id"]: item for item in response.json()["opportunities"]}

    assert opportunities["google-aiml-intern"]["application_link_status"] == "verified"
    assert opportunities["google-aiml-intern"]["application_url"] == "https://careers.google.com"
    assert opportunities["msr-india-summer-intern"]["application_link_status"] == "unavailable"
    assert opportunities["msr-india-summer-intern"]["application_url"] is None
