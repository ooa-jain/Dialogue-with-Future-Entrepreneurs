from datetime import date

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, Query, Response

from ..analytics.engine import build_analytics, research_text
from ..db import get_db
from ..export import build_workbook
from ..schemas import LoginRequest, LoginResponse
from ..security import create_token, require_admin, verify_admin

router = APIRouter(prefix="/admin", tags=["admin"])

RespondentType = Query("faculty", pattern="^(faculty|student)$")


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest) -> LoginResponse:
    if not verify_admin(payload.username, payload.password):
        raise HTTPException(status_code=401, detail="Incorrect username or password.")
    token, ttl = create_token(payload.username.strip())
    return LoginResponse(token=token, expires_in=ttl, username=payload.username.strip())


@router.get("/session")
async def session(user: str = Depends(require_admin)) -> dict:
    return {"username": user}


async def _fetch(respondent_type: str) -> list[dict]:
    db = get_db()
    cursor = db.responses.find({"respondent_type": respondent_type}).sort("created_at", -1)
    rows = await cursor.to_list(length=20000)
    for r in rows:
        r["id"] = str(r.pop("_id"))
        r.pop("source", None)
    return rows


@router.get("/analytics")
async def analytics(
    respondent_type: str = RespondentType,
    _: str = Depends(require_admin),
) -> dict:
    rows = await _fetch(respondent_type)
    return build_analytics(rows, respondent_type)


@router.get("/overview")
async def overview(_: str = Depends(require_admin)) -> dict:
    db = get_db()
    return {
        "faculty": await db.responses.count_documents({"respondent_type": "faculty"}),
        "student": await db.responses.count_documents({"respondent_type": "student"}),
    }


@router.get("/responses")
async def responses(
    respondent_type: str = RespondentType,
    q: str = Query("", max_length=200),
    scope: str = Query("", pattern="^(|self|india|research)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    _: str = Depends(require_admin),
) -> dict:
    rows = await _fetch(respondent_type)
    needle = q.strip().lower()

    def matches(r: dict) -> bool:
        if scope == "self" and not str(r.get("vision_self") or "").strip():
            return False
        if scope == "india" and not str(r.get("vision_india") or "").strip():
            return False
        if scope == "research" and not research_text(r).strip():
            return False
        if not needle:
            return True
        engagements = " ".join(
            f"{e.get('programme', '')} {e.get('semester', '')} {e.get('course_name', '')}"
            for e in (r.get("engagements") or [])
        )
        haystack = " ".join(
            str(x or "")
            for x in (
                r.get("name"), r.get("email"), r.get("department"), r.get("location"),
                r.get("level"), r.get("programme"), r.get("year"), engagements,
                research_text(r), r.get("vision_self"), r.get("vision_india"),
            )
        ).lower()
        return needle in haystack

    filtered = [r for r in rows if matches(r)]
    start = (page - 1) * page_size
    return {
        "total": len(rows),
        "filtered": len(filtered),
        "page": page,
        "page_size": page_size,
        "items": filtered[start : start + page_size],
    }


@router.delete("/responses/{response_id}", status_code=204)
async def delete_response(response_id: str, _: str = Depends(require_admin)) -> Response:
    try:
        oid = ObjectId(response_id)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=400, detail="Invalid response id.")
    result = await get_db().responses.delete_one({"_id": oid})
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail="That response no longer exists.")
    return Response(status_code=204)


@router.get("/export")
async def export(
    respondent_type: str = RespondentType,
    _: str = Depends(require_admin),
) -> Response:
    rows = await _fetch(respondent_type)
    if not rows:
        raise HTTPException(status_code=404, detail="There are no responses to export yet.")
    blob = build_workbook(rows, respondent_type)
    label = "Faculty" if respondent_type == "faculty" else "Student"
    filename = f"Dialogue_Future_Entrepreneurs_{label}_{date.today().isoformat()}.xlsx"
    return Response(
        content=blob,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
