"""Insert sample responses so the dashboard can be reviewed before launch.

    python seed.py            # add sample faculty + student responses
    python seed.py --wipe     # clear the collection first
"""

import argparse
import asyncio
import random

from app.db import connect, disconnect, get_db
from app.sample_data import faculty_docs, student_docs

async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--wipe", action="store_true", help="delete existing responses first")
    parser.add_argument("--faculty", type=int, default=18)
    parser.add_argument("--students", type=int, default=24)
    args = parser.parse_args()

    random.seed(7)
    await connect()
    db = get_db()
    if args.wipe:
        await db.responses.delete_many({})
        print("Cleared existing responses.")
    docs = faculty_docs(args.faculty) + student_docs(args.students)
    await db.responses.insert_many(docs)
    print(f"Inserted {args.faculty} faculty and {args.students} student responses.")
    await disconnect()


if __name__ == "__main__":
    asyncio.run(main())
