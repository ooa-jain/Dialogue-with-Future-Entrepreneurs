"""Database access.

Production uses Motor against a real MongoDB server. When USE_MOCK_DB=1 the
same async API is served by an in-memory stand-in (mongomock-motor) so the app
can be run and demoed on a machine without MongoDB installed. Application code
never branches on this — it only ever talks to `get_db()`.
"""

import logging

from .config import get_settings

log = logging.getLogger("dialogue.db")

_client = None
_db = None


async def connect() -> None:
    global _client, _db
    settings = get_settings()

    if settings.use_mock_db:
        from mongomock_motor import AsyncMongoMockClient  # dev-only dependency

        _client = AsyncMongoMockClient()
        _db = _client[settings.mongodb_db]
        log.warning("USE_MOCK_DB=1 — using an in-memory database. Data is not persisted.")
        if settings.seed_mock:
            import random

            from .sample_data import faculty_docs, student_docs

            random.seed(7)
            await _db.responses.insert_many(faculty_docs(18) + student_docs(24))
            log.warning("SEED_MOCK=1 — loaded sample responses into the in-memory database.")
        return

    from motor.motor_asyncio import AsyncIOMotorClient

    _client = AsyncIOMotorClient(settings.mongodb_url, serverSelectionTimeoutMS=5000)
    _db = _client[settings.mongodb_db]
    await _db.command("ping")
    await _db.responses.create_index("created_at")
    await _db.responses.create_index([("respondent_type", 1), ("created_at", -1)])
    log.info("Connected to MongoDB database %s", settings.mongodb_db)


async def disconnect() -> None:
    global _client, _db
    if _client is not None and hasattr(_client, "close"):
        _client.close()
    _client = None
    _db = None


def get_db():
    if _db is None:
        raise RuntimeError("Database is not connected")
    return _db
