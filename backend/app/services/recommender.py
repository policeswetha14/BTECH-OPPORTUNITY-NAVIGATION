from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any

from app.data.sample_data import OPPORTUNITIES, STUDENT_PROFILE


def normalize_text(value: Any) -> str:
    if value is None:
        return ""
    cleaned = str(value).lower().replace("&", " and ").replace("/", " ")
    cleaned = cleaned.replace("-", " ").replace("_", " ")
    cleaned = re.sub(r"[^a-z0-9]+", " ", cleaned)
    return re.sub(r"\s+", " ", cleaned).strip()


def normalize_skill(skill: str) -> str:
    return normalize_text(skill)


def normalize_choice(value: Any) -> str:
    return normalize_text(value)


def normalize_branch(branch: Any) -> str:
    alias_map = {
        "cse": "computer science",
        "cs": "computer science",
        "computer science and engineering": "computer science",
        "computer science engg": "computer science",
        "computer science": "computer science",
        "it": "information technology",
        "information technology and engineering": "information technology",
        "information technology": "information technology",
        "ece": "electronics",
        "electronics and communication engineering": "electronics",
        "electronics and communication": "electronics",
        "eee": "electrical",
        "electrical and electronics engineering": "electrical",
        "electrical and electronics": "electrical",
    }
    text = normalize_choice(branch)
    return alias_map.get(text, text)


def year_matches(student_year: int, requirements: Any) -> bool:
    if not requirements:
        return True
    if isinstance(requirements, str):
        requirements = [requirements]

    normalized_year = str(student_year).strip().lower()
    expected_years: set[str] = set()

    for requirement in requirements:
        text = normalize_choice(requirement)
        if not text:
            continue

        year_matches_for_requirement = {
            match.group(0)
            for match in re.finditer(r"\d+", text)
        }
        for phrase, value in {
            "first": "1",
            "second": "2",
            "third": "3",
            "fourth": "4",
            "final": "4",
            "pre final": "3",
            "prefinal": "3",
            "pre final year": "3",
            "final year": "4",
        }.items():
            if phrase in text:
                year_matches_for_requirement.add(value)
        if year_matches_for_requirement:
            expected_years.update(year_matches_for_requirement)

    if not expected_years:
        expected_years = {normalize_choice(requirement) for requirement in requirements}
    return normalized_year in expected_years


def score_deadline(deadline: str) -> float:
    try:
        target = datetime.fromisoformat(deadline.replace("Z", "+00:00")).astimezone(timezone.utc)
        delta = (target - datetime.now(timezone.utc)).days
    except ValueError:
        return 0.5
    if delta <= 2:
        return 1.0
    if delta <= 7:
        return 0.8
    if delta <= 30:
        return 0.6
    return 0.4


def compute_stage_score(student_year: int, opportunity: Any) -> float:
    if not opportunity.academic_year_requirements:
        return 1.0
    if year_matches(student_year, opportunity.academic_year_requirements):
        return 1.0
    return 0.5


def compute_interest_score(student: Any, opportunity: Any) -> float:
    if not student.interests:
        return 0.5

    student_tokens = {
        token
        for item in student.interests
        for token in normalize_skill(item).split()
        if token
    }
    opportunity_tokens = {
        token
        for item in [opportunity.category, opportunity.title, opportunity.description]
        for token in normalize_skill(item).split()
        if token
    }
    overlap = student_tokens.intersection(opportunity_tokens)
    if not overlap:
        return 0.4
    return min(1.0, len(overlap) / max(1, len(student_tokens)))


def compute_skill_score(student: Any, opportunity: Any) -> float:
    required = [normalize_skill(skill) for skill in opportunity.required_skills]
    if not required:
        return 1.0
    student_skills = {normalize_skill(skill) for skill in student.skills}
    hits = sum(1 for skill in required if skill in student_skills)
    return hits / len(required)


def evaluate_opportunity(student: Any, opportunity: Any) -> dict[str, Any]:
    missing_skills = []
    preferred_gaps = []
    blocking = False

    student_skills = {normalize_skill(skill) for skill in student.skills}

    for skill in opportunity.required_skills:
        key = normalize_skill(skill)
        if key not in student_skills:
            missing_skills.append(skill)
            blocking = True

    for skill in opportunity.preferred_skills:
        key = normalize_skill(skill)
        if key not in student_skills:
            preferred_gaps.append(skill)

    status = "eligible"
    if blocking:
        status = "not_eligible"
    elif missing_skills or preferred_gaps:
        status = "partially_eligible"

    branch_match = (
        not opportunity.branch_requirements
        or normalize_branch(student.branch) in {normalize_branch(item) for item in opportunity.branch_requirements}
    )
    year_match = year_matches(student.year, opportunity.academic_year_requirements)
    cgpa_ok = opportunity.cgpa_requirement is None or student.cgpa >= opportunity.cgpa_requirement
    if not branch_match or not year_match or not cgpa_ok:
        status = "not_eligible"

    if status == "eligible":
        reasons = [
            "Meets the formal branch and academic stage requirements.",
            "Academic profile clears the stated CGPA threshold.",
            "All mandatory technical skills are present.",
        ]
    elif status == "partially_eligible":
        reasons = [
            "Formal eligibility is satisfied, but the opportunity expects stronger alignment with preferred skills.",
            "The skill gap is manageable with focused preparation before application.",
        ]
    else:
        reasons = [
            "A mandatory eligibility or skill criterion is not currently met.",
            "This opportunity is not a direct match for the current profile.",
        ]

    return {
        "status": status,
        "branch_match": branch_match,
        "year_match": year_match,
        "cgpa_ok": cgpa_ok,
        "missing_skills": missing_skills,
        "preferred_gaps": preferred_gaps,
        "reasons": reasons,
    }


def recommendation_score(student: Any, opportunity: Any) -> tuple[int, dict[str, Any], list[str]]:
    eligibility = evaluate_opportunity(student, opportunity)
    skill_component = compute_skill_score(student, opportunity)
    stage_component = compute_stage_score(student.year, opportunity)
    branch_component = 1.0 if (
        not opportunity.branch_requirements
        or normalize_branch(student.branch) in {normalize_branch(item) for item in opportunity.branch_requirements}
    ) else 0.0
    interest_component = compute_interest_score(student, opportunity)
    deadline_component = score_deadline(opportunity.deadline)

    student_mode = normalize_choice(getattr(student, "mode", "") or "")
    opportunity_mode = normalize_choice(getattr(opportunity, "mode", "") or "")
    mode_component = 1.0 if opportunity_mode == student_mode or student_mode in {"hybrid", "remote"} else 0.7

    weighted = (
        (0.30 * (1.0 if eligibility["status"] == "eligible" else 0.6 if eligibility["status"] == "partially_eligible" else 0.15))
        + (0.25 * skill_component)
        + (0.15 * stage_component)
        + (0.10 * branch_component)
        + (0.10 * interest_component)
        + (0.05 * deadline_component)
        + (0.05 * mode_component)
    )

    score = int(round(weighted * 100))
    breakdown = {
        "Eligibility": 100 if eligibility["status"] == "eligible" else 60 if eligibility["status"] == "partially_eligible" else 15,
        "Skills": int(round(skill_component * 100)),
        "Academic Stage": int(round(stage_component * 100)),
        "Branch": int(round(branch_component * 100)),
        "Interests": int(round(interest_component * 100)),
        "Deadline": int(round(deadline_component * 100)),
    }

    priority_skills = eligibility["missing_skills"][:3] if eligibility["missing_skills"] else opportunity.preferred_skills[:3]
    return score, breakdown, priority_skills


def build_roadmap(skill: str | None) -> list[str]:
    roadmap_map = {
        "sql": ["SQL fundamentals", "Joins and filtering", "Aggregations", "Subqueries", "Practice queries"],
        "python": ["Python basics", "Functions and classes", "Data structures", "Project practice", "Automation tasks"],
        "machine learning": ["Statistics", "Feature engineering", "Model selection", "Evaluation", "Portfolio project"],
        "git": ["Git basics", "Branching", "Merge conflicts", "Pull requests", "Code reviews"],
        "rest api": ["HTTP concepts", "REST design", "Authentication", "FastAPI/Express", "API integration"],
        "data structures": ["Arrays and lists", "Trees", "Graphs", "Hash maps", "Problem solving"],
        "javascript": ["JS basics", "DOM and events", "Async programming", "TypeScript", "Frontend practice"],
        "nlp": ["Text preprocessing", "Tokenization", "Embeddings", "Evaluation", "Mini-project"],
    }
    normalized = normalize_skill(skill or "")
    if not normalized:
        return ["Refresh your core fundamentals", "Build a small applied project", "Track measurable outcomes"]
    return roadmap_map.get(normalized, [f"Study {skill} fundamentals", f"Apply {skill} in a mini project", f"Validate with a portfolio outcome"])


def create_dashboard(
    student: Any | None = None,
    opportunities: list[Any] | None = None,
    application_status: list[dict[str, str]] | None = None,
) -> dict[str, Any]:
    student = student or STUDENT_PROFILE
    opportunities = OPPORTUNITIES if opportunities is None else opportunities
    recommendations = []
    for opp in OPPORTUNITIES:
        score, breakdown, priority_skills = recommendation_score(student, opp)
        eligibility = evaluate_opportunity(student, opp)
        recommendations.append(
            {
                "opportunity_id": opp.id,
                "title": opp.title,
                "organization": opp.organization,
                "category": opp.category,
                "match_score": score,
                "eligibility_status": eligibility["status"],
                "reasons": eligibility["reasons"],
                "missing_skills": eligibility["missing_skills"],
                "priority_skills": priority_skills,
                "deadline": opp.deadline,
                "verification_status": opp.verification_status,
                "breakdown": breakdown,
            }
        )

    sorted_recommendations = sorted(recommendations, key=lambda item: item["match_score"], reverse=True)
    missing_skills = sorted(
        {skill for item in sorted_recommendations for skill in item["missing_skills"]},
        key=lambda skill: skill.lower(),
    )
    roadmaps = [
        {"skill": skill, "priority": "High" if idx < 2 else "Medium", "steps": build_roadmap(skill)}
        for idx, skill in enumerate(missing_skills[:4])
    ]

    urgent_deadlines = [
        {"title": opp.title, "deadline": opp.deadline, "status": "Urgent" if score_deadline(opp.deadline) > 0.7 else "Upcoming"}
        for opp in OPPORTUNITIES
    ]
    profile_values = [
        student.name,
        student.branch,
        student.year,
        student.semester,
        student.cgpa,
        student.skills,
        student.interests,
        student.preferred_opportunity_types,
        student.location,
        student.mode,
        student.career_goal,
    ]
    profile_completion = round(
        100 * sum(bool(value) for value in profile_values) / max(1, len(profile_values))
    )
    leading_category = (
        sorted_recommendations[0]["category"]
        if sorted_recommendations
        else "opportunities"
    )
    next_skill = missing_skills[0] if missing_skills else None

    return {
        "student": {
            "name": student.name,
            "branch": student.branch,
            "year": student.year,
            "semester": student.semester,
            "cgpa": student.cgpa,
            "skills": student.skills,
            "interests": student.interests,
            "preferred_opportunity_types": student.preferred_opportunity_types,
            "location": student.location,
            "mode": student.mode,
            "career_goal": student.career_goal,
        },
        "recommendations": sorted_recommendations,
        "skill_gaps": missing_skills,
        "roadmap": roadmaps,
        "urgent_deadlines": sorted(urgent_deadlines, key=lambda item: item["deadline"]),
        "profile_completion": profile_completion,
        "application_status": application_status or [],
        "ai_summary": {
            "headline": f"Your top-scoring current category is {leading_category}.",
            "next_best_action": (
                f"Strengthen {next_skill} to improve alignment with open opportunities."
                if next_skill
                else "Review current opportunities and keep your profile up to date."
            ),
        },
    }


def explore_alternatives(
    student: Any,
    opportunity: Any,
    opportunities: list[Any] | None = None,
) -> list[dict[str, Any]]:
    alternatives = []
    for item in OPPORTUNITIES if opportunities is None else opportunities:
        if item.id == opportunity.id:
            continue
        score, _, _ = recommendation_score(student, item)
        eligibility = evaluate_opportunity(student, item)
        if score >= 65:
            alternatives.append({
                "title": item.title,
                "match_score": score,
                "eligibility_status": eligibility["status"],
                "deadline": item.deadline,
            })
    return sorted(alternatives, key=lambda item: item["match_score"], reverse=True)[:3]


__all__ = [
    "STUDENT_PROFILE",
    "OPPORTUNITIES",
    "evaluate_opportunity",
    "recommendation_score",
    "create_dashboard",
    "explore_alternatives",
]
