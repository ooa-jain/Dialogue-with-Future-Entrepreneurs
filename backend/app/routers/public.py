from datetime import datetime, timezone

from fastapi import APIRouter, Request

from ..analytics.engine import reference_data
from ..db import get_db
from ..schemas import FacultySubmission, StudentSubmission, SubmissionAck

router = APIRouter(tags=["public"])


@router.get("/meta")
async def meta() -> dict:
    ref = reference_data()
    return {
        "departments": ref["departments"],
        "semesters": ref["semesters"],
        "locations": ref["locations"],
        "levels": ref["levels"],
        "years_by_level": ref["years_by_level"],
    }


async def _store(document: dict, request: Request) -> SubmissionAck:
    db = get_db()
    now = datetime.now(timezone.utc)
    document["created_at"] = now
    document["source"] = {
        "user_agent": request.headers.get("user-agent", "")[:300],
        "referer": request.headers.get("referer", "")[:300],
    }
    result = await db.responses.insert_one(document)
    return SubmissionAck(
        id=str(result.inserted_id),
        respondent_type=document["respondent_type"],
        created_at=now,
        message="Your reflection has been recorded.",
    )


@router.post("/responses/faculty", response_model=SubmissionAck, status_code=201)
async def submit_faculty(payload: FacultySubmission, request: Request) -> SubmissionAck:
    doc = payload.model_dump(mode="json")
    doc["respondent_type"] = "faculty"
    doc["engagements"] = [dict(e) for e in doc["engagements"]]
    return await _store(doc, request)


@router.post("/responses/student", response_model=SubmissionAck, status_code=201)
async def submit_student(payload: StudentSubmission, request: Request) -> SubmissionAck:
    doc = payload.model_dump(mode="json")
    doc["respondent_type"] = "student"
    return await _store(doc, request)
