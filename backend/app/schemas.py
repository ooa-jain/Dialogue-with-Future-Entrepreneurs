from datetime import date, datetime
from typing import Annotated, Literal, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

Text = Annotated[str, Field(max_length=8000)]
ShortText = Annotated[str, Field(max_length=300)]


def _clean(value: str) -> str:
    return " ".join(str(value or "").split())


class Engagement(BaseModel):
    programme: ShortText
    semester: ShortText
    course_name: ShortText

    @field_validator("programme", "semester", "course_name")
    @classmethod
    def strip(cls, v: str) -> str:
        return _clean(v)


class FacultySubmission(BaseModel):
    name: ShortText
    email: Optional[EmailStr] = None
    department: ShortText
    location: ShortText
    research_expertise: Text
    research_interests: Text
    research_focus: Text
    research_impact: Text
    engagements: list[Engagement] = Field(min_length=1, max_length=25)
    meeting_date: date
    vision_self: Text
    vision_india: Text

    @field_validator("name", "department", "location")
    @classmethod
    def required_short(cls, v: str) -> str:
        v = _clean(v)
        if not v:
            raise ValueError("This field is required")
        return v

    @field_validator(
        "research_expertise",
        "research_interests",
        "research_focus",
        "research_impact",
        "vision_self",
        "vision_india",
    )
    @classmethod
    def required_long(cls, v: str) -> str:
        v = str(v or "").strip()
        if not v:
            raise ValueError("This field is required")
        return v

    @field_validator("engagements")
    @classmethod
    def complete_engagements(cls, v: list[Engagement]) -> list[Engagement]:
        for e in v:
            if not (e.programme and e.semester and e.course_name):
                raise ValueError("Every academic engagement needs a programme, semester and course name")
        return v


class StudentSubmission(BaseModel):
    name: ShortText
    email: Optional[EmailStr] = None
    department: ShortText
    location: ShortText
    level: ShortText
    programme: ShortText
    year: ShortText
    vision_self: Text
    vision_india: Text

    @field_validator("name", "department", "location", "level", "programme", "year")
    @classmethod
    def required_short(cls, v: str) -> str:
        v = _clean(v)
        if not v:
            raise ValueError("This field is required")
        return v

    @field_validator("vision_self", "vision_india")
    @classmethod
    def required_long(cls, v: str) -> str:
        v = str(v or "").strip()
        if not v:
            raise ValueError("This field is required")
        return v


class SubmissionAck(BaseModel):
    id: str
    respondent_type: Literal["student", "faculty"]
    created_at: datetime
    message: str


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    token: str
    expires_in: int
    username: str
