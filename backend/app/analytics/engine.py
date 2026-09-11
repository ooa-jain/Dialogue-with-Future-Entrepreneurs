"""Theme, research and summary analytics.

This is a faithful Python port of the scoring logic that ran in the original
standalone HTML dashboards, so numbers stay comparable with earlier reports:

  * keyword scoring   — 3 points per multi-word phrase, 1 per single word
  * semantic rules    — +5 for a natural-language paraphrase
  * multi-theme count — every theme scoring >= 38% of the best score
  * pie distribution  — each response counted once, under its strongest theme
  * graceful fallback — a response that matches nothing gets a readable
                        "Emerging ..." label built from its own words
"""

from __future__ import annotations

import json
import math
import re
from collections import Counter, defaultdict
from datetime import date, datetime, timedelta, timezone
from functools import lru_cache
from pathlib import Path
from typing import Any, Iterable

DATA_DIR = Path(__file__).parent / "data"


@lru_cache
def _load(name: str) -> Any:
    return json.loads((DATA_DIR / name).read_text(encoding="utf-8"))


def theme_keywords() -> dict:
    return _load("theme_keywords.json")


def semantic_rules() -> dict:
    return _load("semantic_rules.json")


def research_categories() -> dict:
    return _load("research_categories.json")


def reference_data() -> dict:
    return _load("reference.json")


# --------------------------------------------------------------------------
# text normalisation
# --------------------------------------------------------------------------

_APOS = re.compile(r"[’']")
_SEPS = re.compile(r"[-_/&]")
_NON_ALNUM = re.compile(r"[^a-z0-9\s]")
_WS = re.compile(r"\s+")


def normalize(text: str) -> str:
    t = _APOS.sub("'", str(text or "").lower())
    t = _SEPS.sub(" ", t)
    t = _NON_ALNUM.sub(" ", t)
    return _WS.sub(" ", t).strip()


def _contains_phrase(haystack_padded: str, phrase: str) -> bool:
    p = normalize(phrase)
    return bool(p) and f" {p} " in haystack_padded


# --------------------------------------------------------------------------
# theme scoring
# --------------------------------------------------------------------------

STOPWORDS = set(
    "the and for with that this my our your future india country's from into about very "
    "will have has had are was were is to of in on a an as be by or at it i we they their "
    "them you me can could should would want wish hope make making become becoming through "
    "using use more most also just than then who what where when how which".split()
)


def theme_scores(text: str, scope: str) -> dict[str, int]:
    keyword_map = theme_keywords()[scope]
    padded = f" {normalize(text)} "
    scores: dict[str, int] = {}

    for theme, words in keyword_map.items():
        score = 0
        for word in words:
            p = normalize(word)
            if p and f" {p} " in padded:
                score += 3 if len(p.split()) >= 2 else 1
        if score:
            scores[theme] = score

    for theme, phrases in semantic_rules().get(scope, []):
        for phrase in phrases:
            if _contains_phrase(padded, phrase):
                scores[theme] = scores.get(theme, 0) + 5

    return scores


def fallback_theme(text: str, scope: str) -> str:
    words = [w for w in normalize(text).split() if len(w) >= 5 and w not in STOPWORDS]
    if not words:
        return "Personal Aspirations"
    top = [w for w, _ in Counter(words).most_common(3)]
    label = " · ".join(w.capitalize() for w in top)
    prefix = "Emerging National Priority: " if scope == "india" else "Emerging Aspiration: "
    return prefix + label


def theme_counts(texts: Iterable[str], scope: str) -> list[list]:
    """All meaningful themes per response (a response may hit several)."""
    counts: Counter[str] = Counter()
    for text in texts:
        if not str(text or "").strip():
            continue
        scores = theme_scores(text, scope)
        if not scores:
            counts[fallback_theme(text, scope)] += 1
            continue
        best = max(scores.values())
        threshold = max(1, math.ceil(best * 0.38))
        for theme, score in scores.items():
            if score >= threshold:
                counts[theme] += 1
    return [[name, count] for name, count in counts.most_common()]


def primary_theme_distribution(texts: Iterable[str], scope: str) -> list[list]:
    """One theme per response — mutually exclusive slices for the pie."""
    counts: Counter[str] = Counter()
    for text in texts:
        if not str(text or "").strip():
            continue
        scores = theme_scores(text, scope)
        if not scores:
            counts[fallback_theme(text, scope)] += 1
            continue
        primary = max(scores.items(), key=lambda kv: kv[1])[0]
        counts[primary] += 1
    return [[name, count] for name, count in counts.most_common()]


def collapse(entries: list[list], keep: int, other_label: str) -> list[list]:
    """Keep the strongest `keep` slices, fold the rest into one."""
    if len(entries) <= keep:
        return [list(e) for e in entries]
    visible = [list(e) for e in entries[:keep]]
    remainder = sum(e[1] for e in entries[keep:])
    if remainder:
        visible.append([other_label, remainder])
    return visible


# --------------------------------------------------------------------------
# research landscape (faculty only)
# --------------------------------------------------------------------------

_RESEARCH_CLEAN = re.compile(r"[^a-z0-9+#.\-]+")


def _research_norm(text: str) -> str:
    return _RESEARCH_CLEAN.sub(" ", str(text or "").lower())


def research_text(response: dict) -> str:
    return " ".join(
        str(response.get(k) or "")
        for k in ("research_expertise", "research_interests", "research_focus", "research_impact")
    ).lower()


def research_matches(text: str) -> list[str]:
    padded = f" {_research_norm(text)} "
    out = []
    for name, cfg in research_categories().items():
        for word in cfg["words"]:
            if f" {_research_norm(word)} " in padded:
                out.append(name)
                break
    return out


# --------------------------------------------------------------------------
# participation over time, reflection depth, shared vocabulary
# --------------------------------------------------------------------------

TIMELINE_DAYS = 30


def _as_date(value: Any) -> date | None:
    """created_at is a datetime from Mongo, an ISO string from an import."""
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    if isinstance(value, str) and value:
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00")).date()
        except ValueError:
            return None
    return None


def daily_timeline(responses: list[dict], days: int = TIMELINE_DAYS) -> dict:
    """One point per day for the trailing window — empty days included, so the
    wave keeps its shape instead of joining two distant peaks."""
    today = datetime.now(timezone.utc).date()
    start = today - timedelta(days=days - 1)

    per_day: Counter[date] = Counter()
    for r in responses:
        d = _as_date(r.get("created_at"))
        if d is not None:
            per_day[d] += 1

    points = []
    for i in range(days):
        d = start + timedelta(days=i)
        points.append([d.isoformat(), per_day.get(d, 0)])

    in_window = sum(c for _, c in points)
    last_seven = sum(c for _, c in points[-7:])
    peak = max(points, key=lambda p: p[1]) if points else ["—", 0]
    return {
        "days": days,
        "points": points,
        "in_window": in_window,
        "last_seven": last_seven,
        "peak": peak,
        "dated": sum(1 for r in responses if _as_date(r.get("created_at")) is not None),
    }


def word_count(text: str) -> int:
    return len([w for w in normalize(text).split() if w])


def reflection_depth(responses: list[dict]) -> dict:
    """How much people actually wrote — the honest measure of engagement."""
    totals = [
        word_count(r.get("vision_self", "")) + word_count(r.get("vision_india", ""))
        for r in responses
    ]
    written = [t for t in totals if t]
    return {
        "avg_total": round(sum(written) / len(written), 1) if written else 0.0,
        "words_written": sum(totals),
    }


VOICE_STOPWORDS = STOPWORDS | set(
    "there where while every each many much such other others own same still even "
    "only after before between during without within across along around because "
    "since until upon these those them themselves myself ourselves being been does "
    "doing done get gets getting going goes go come comes came like likes really "
    "well good better best able need needs needed give given gives take takes "
    "taken work works working think thinks thinking see sees seen say says said "
    "know knows knowing look looks looking lot bit way ways thing things".split()
)


def top_words(texts: Iterable[str], limit: int = 12) -> list[list]:
    """The words the cohort reaches for, once the scaffolding is stripped out."""
    counts: Counter[str] = Counter()
    for text in texts:
        seen = {
            w for w in normalize(text).split()
            if len(w) >= 5 and w not in VOICE_STOPWORDS and not w.isdigit()
        }
        counts.update(seen)  # once per response, so one long answer cannot dominate
    return [[w.capitalize(), c] for w, c in counts.most_common(limit) if c > 1]


# --------------------------------------------------------------------------
# grouping helpers
# --------------------------------------------------------------------------


def count_by(responses: list[dict], field: str) -> list[list]:
    counts: Counter[str] = Counter()
    for r in responses:
        key = str(r.get(field) or "").strip() or "Unspecified"
        counts[key] += 1
    return [[k, v] for k, v in counts.most_common()]


def count_engagements_by(responses: list[dict], field: str) -> list[list]:
    counts: Counter[str] = Counter()
    for r in responses:
        for e in r.get("engagements") or []:
            key = str(e.get(field) or "").strip() or "Unspecified"
            counts[key] += 1
    return [[k, v] for k, v in counts.most_common()]


def _group_themes(responses: list[dict], field: str, order: dict[str, int] | None = None) -> list[dict]:
    groups: dict[str, list[dict]] = defaultdict(list)
    for r in responses:
        groups[str(r.get(field) or "").strip() or "Unspecified"].append(r)

    def sort_key(name: str):
        if order:
            return (order.get(name, 99), name)
        return (0, name)

    out = []
    for name in sorted(groups, key=sort_key):
        rows = groups[name]
        out.append(
            {
                "name": name,
                "total": len(rows),
                "self": theme_counts([r.get("vision_self", "") for r in rows], "self")[:5],
                "india": theme_counts([r.get("vision_india", "") for r in rows], "india")[:5],
            }
        )
    return out


LEVEL_ORDER = {"UG": 1, "PG": 2, "Higher / Research": 3, "Higher/Research": 3, "Research": 3}


# --------------------------------------------------------------------------
# public entry point
# --------------------------------------------------------------------------


def build_analytics(responses: list[dict], respondent_type: str) -> dict:
    total = len(responses)
    self_texts = [r.get("vision_self", "") for r in responses]
    india_texts = [r.get("vision_india", "") for r in responses]

    self_themes = theme_counts(self_texts, "self")
    india_themes = theme_counts(india_texts, "india")
    self_pie = primary_theme_distribution(self_texts, "self")
    india_pie = primary_theme_distribution(india_texts, "india")

    departments = count_by(responses, "department")
    locations = count_by(responses, "location")

    payload: dict[str, Any] = {
        "respondent_type": respondent_type,
        "total": total,
        "cards": [],
        "charts": {"department": departments, "location": locations},
        "themes": {"self": self_themes, "india": india_themes},
        "theme_pies": {
            "self": collapse(self_pie, 7, "Remaining identified themes"),
            "india": collapse(india_pie, 7, "Remaining identified themes"),
        },
        "timeline": daily_timeline(responses),
        "depth": reflection_depth(responses),
        "voice": top_words(list(self_texts) + list(india_texts)),
        "insights": {
            "leading_self": self_themes[0] if self_themes else ["—", 0],
            "leading_india": india_themes[0] if india_themes else ["—", 0],
            "analysed": total,
            "themes_detected": len({t for t, _ in self_themes} | {t for t, _ in india_themes}),
        },
        "group_themes": [],
        "summary": {},
    }

    if respondent_type == "faculty":
        programmes = {
            e.get("programme")
            for r in responses
            for e in (r.get("engagements") or [])
            if e.get("programme")
        }
        semesters = {
            e.get("semester") for r in responses for e in (r.get("engagements") or []) if e.get("semester")
        }
        courses = {
            e.get("course_name")
            for r in responses
            for e in (r.get("engagements") or [])
            if e.get("course_name")
        }
        research_profiles = [r for r in responses if research_text(r).strip()]

        payload["cards"] = [
            ["Total Responses", total],
            ["Departments Represented", len({d for d, _ in departments if d != "Unspecified"})],
            ["Programmes Represented", len(programmes)],
            ["Courses Represented", len(courses)],
            ["Research Profiles", len(research_profiles)],
            ["Locations Represented", len({l for l, _ in locations if l != "Unspecified"})],
        ]
        payload["charts"]["semester"] = count_engagements_by(responses, "semester")
        payload["charts"]["programme"] = count_engagements_by(responses, "programme")
        payload["research"] = _build_research(responses, research_profiles)
        payload["group_themes"] = _group_themes(responses, "department")
        payload["group_label"] = "Department"
        _ = semesters
    else:
        payload["cards"] = [
            ["Total Responses", total],
            ["Departments Represented", len({d for d, _ in departments if d != "Unspecified"})],
            ["Programmes Represented", len({str(r.get("programme") or "").strip() for r in responses} - {""})],
            ["Locations Represented", len({l for l, _ in locations if l != "Unspecified"})],
            ["Levels Represented", len({str(r.get("level") or "").strip() for r in responses} - {""})],
        ]
        payload["charts"]["programme"] = count_by(responses, "programme")
        payload["charts"]["level"] = count_by(responses, "level")
        payload["charts"]["year"] = count_by(responses, "year")
        payload["group_themes"] = _group_themes(responses, "department")
        payload["group_label"] = "Department"
        payload["level_themes"] = _group_themes(responses, "level", LEVEL_ORDER)

    payload["summary"] = _build_summary(responses, respondent_type, departments, locations, self_themes, india_themes)
    return payload


def _build_research(responses: list[dict], research_profiles: list[dict]) -> dict:
    domain_counts: Counter[str] = Counter()
    per_response: list[list[str]] = []
    for r in responses:
        cats = research_matches(research_text(r))
        per_response.append(cats)
        domain_counts.update(cats)

    total_research = len(research_profiles)
    entries = [[k, v] for k, v in domain_counts.most_common()]
    total_classifications = sum(v for _, v in entries)

    categories = []
    for name, cfg in research_categories().items():
        count = domain_counts.get(name, 0)
        people = [
            (r.get("name") or "Faculty")
            for r, cats in zip(responses, per_response)
            if name in cats
        ][:6]
        categories.append(
            {
                "name": name,
                "note": cfg["note"],
                "count": count,
                "pct": round(count / total_research * 100) if total_research else 0,
                "people": people,
            }
        )

    matched = sum(1 for cats in per_response if cats)
    avg = (
        round(sum(len(c) for c in per_response) / total_research, 1) if total_research else 0.0
    )

    return {
        "pie": collapse(entries, 7, "Other research categories"),
        "total_classifications": total_classifications,
        "percent": [
            [name, round(count / total_research * 100, 1) if total_research else 0.0]
            for name, count in entries
        ],
        "insights": {
            "with_profile": total_research,
            "categorised": matched,
            "avg_domains": avg,
        },
        "categories": categories,
    }


def _build_summary(responses, respondent_type, departments, locations, self_themes, india_themes) -> dict:
    audience = "faculty" if respondent_type == "faculty" else "student"
    summary = {
        "audience": audience,
        "total": len(responses),
        "department_count": len({d for d, _ in departments if d != "Unspecified"}),
        "top_department": departments[0][0] if departments else "—",
        "top_location": locations[0][0] if locations else "—",
        "top_self_theme": self_themes[0][0] if self_themes else "no dominant theme yet",
        "top_india_theme": india_themes[0][0] if india_themes else "no dominant theme yet",
    }
    if respondent_type == "student":
        levels = count_by(responses, "level")
        summary["top_level"] = levels[0][0] if levels else "—"
    return summary
