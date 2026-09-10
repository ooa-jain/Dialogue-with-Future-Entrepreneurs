"""Sample response generators used by seed.py and by the dev mock database."""

import random
from datetime import datetime, timedelta, timezone

DEPARTMENTS = [
    "Department of Management Studies",
    "Department of Computer Science and Engineering",
    "Department of Commerce",
    "Department of Biotechnology and Genetics",
    "Department of Economics",
    "Department of Design",
    "Department of Law",
    "Department of Psychology and Allied Science",
]

FACULTY_VISIONS = [
    ("I want to grow into an academic leader who mentors early-career researchers and builds a strong "
     "research culture in my department, while continuing to publish in reputed journals.",
     "I hope to see an India where quality education is accessible in every district and where research "
     "funding reaches state universities, not only the metros."),
    ("My aim is to move from classroom teaching into applied research and consulting, so that the work my "
     "students do reaches industry as real, working solutions.",
     "An India that is a technology leader — strong in artificial intelligence and semiconductors, with "
     "digital infrastructure that reaches rural communities."),
    ("I want to build an eco-friendly campus initiative and take my work on waste management and "
     "sustainable business practice to other institutions.",
     "A green future where climate action is not a policy document but daily practice — clean air, water "
     "conservation and renewable energy in every city."),
    ("Financial independence and a healthy work-life balance matter to me, alongside becoming a recognised "
     "subject-matter expert in corporate finance.",
     "I want India to create meaningful jobs for its youth and reduce poverty through skill development "
     "and support for small businesses."),
    ("I see myself starting a social enterprise that turns our department's design research into products "
     "for rural artisans and women entrepreneurs.",
     "An India where women empowerment and inclusive development are measured, funded and taken seriously."),
    ("Continuous learning is my priority — I want to complete a second doctorate and build international "
     "research collaboration with universities in Europe.",
     "India as a global innovation hub, with strong governance, transparency and citizen participation."),
]

STUDENT_VISIONS = [
    ("I want to build a startup that solves logistics problems for small farmers using simple technology "
     "they can afford.",
     "I want India to be a country where every young person can find a good job without leaving their "
     "hometown."),
    ("My dream is to work in machine learning research and eventually teach, because I want to give back "
     "what my teachers gave me.",
     "An India that leads in artificial intelligence but also protects data privacy and digital safety."),
    ("I want to become a leader in my field, take responsibility early and build teams that people are "
     "proud to be part of.",
     "I imagine an India where education is practical, affordable and connected to real industry needs."),
    ("I want a sustainable lifestyle and a career in clean energy — solar especially — because that is "
     "where I can do the most good.",
     "A green future: less plastic waste, cleaner rivers, and renewable energy powering our cities."),
    ("Financial freedom is important to me, and so is helping my family. I want to build a business that "
     "lasts.",
     "I want India to reduce poverty and give equal opportunities to every community."),
    ("I want to do research in biotechnology and work on affordable healthcare for people who cannot "
     "reach big hospitals.",
     "Universal healthcare for everyone, with telemedicine reaching villages."),
]

PROGRAMMES = ["B.Tech Computer Science", "BBA", "B.Com Corporate Finance", "M.Sc Biotechnology",
              "B.Des Product Design", "BA Economics", "LLB", "MBA"]
COURSES = ["Financial Accounting", "Machine Learning", "Design Thinking", "Molecular Biology",
           "Business Analytics", "Constitutional Law", "Microeconomics"]
SEMESTERS = [f"Semester {r}" for r in ["I", "II", "III", "IV", "V", "VI"]]
LEVELS = ["UG", "PG", "Higher / Research"]
YEARS = {
    "UG": ["Year 1 · Semester I", "Year 2 · Semester III", "Year 3 · Semester V", "Year 4 · Semester VII"],
    "PG": ["Year 1 · Semester I", "Year 2 · Semester III"],
    "Higher / Research": ["Research / Doctoral", "Higher Studies / Other"],
}
RESEARCH = [
    ("Corporate finance and capital markets", "Behavioural finance and investor decision making",
     "A study of retail investor behaviour in Indian equity markets",
     "Helping regulators design better investor-protection policy."),
    ("Machine learning and computer vision", "Explainable AI for healthcare imaging",
     "Deep learning models for early screening in low-resource clinics",
     "Making diagnostic support affordable for rural healthcare."),
    ("Environmental science and waste management", "Circular economy and plastic recycling",
     "Municipal solid waste segregation models for tier-2 cities",
     "Reducing landfill pressure and creating green jobs."),
    ("Molecular biology and genetics", "Crop resilience and food security",
     "Drought-tolerant traits in millets",
     "Supporting farmer income and nutrition security."),
    ("Design research and human-centred design", "Craft-led product innovation",
     "Documenting and modernising regional craft practice",
     "Creating livelihoods for artisan communities."),
    ("Constitutional law and public policy", "Digital rights and data protection",
     "Comparative study of privacy legislation",
     "Informing policy reform on citizen data rights."),
]

FIRST = ["Aarav", "Diya", "Rohan", "Meera", "Karthik", "Ananya", "Vikram", "Sneha", "Arjun", "Priya",
         "Nikhil", "Lakshmi", "Rahul", "Kavya", "Suresh", "Divya"]
LAST = ["Sharma", "Nair", "Reddy", "Iyer", "Kulkarni", "Menon", "Rao", "Gupta", "Prasad", "Shetty"]


def name() -> str:
    return f"{random.choice(FIRST)} {random.choice(LAST)}"


def faculty_docs(n: int) -> list[dict]:
    docs = []
    for i in range(n):
        exp, interests, focus, impact = RESEARCH[i % len(RESEARCH)]
        vs, vi = FACULTY_VISIONS[i % len(FACULTY_VISIONS)]
        engagements = [
            {
                "programme": random.choice(PROGRAMMES),
                "semester": random.choice(SEMESTERS),
                "course_name": random.choice(COURSES),
            }
            for _ in range(random.randint(1, 3))
        ]
        docs.append(
            {
                "respondent_type": "faculty",
                "name": f"Dr. {name()}",
                "email": None,
                "department": DEPARTMENTS[i % len(DEPARTMENTS)],
                "location": random.choice(["Bangalore", "Kochi"]),
                "research_expertise": exp,
                "research_interests": interests,
                "research_focus": focus,
                "research_impact": impact,
                "engagements": engagements,
                "meeting_date": (datetime.now(timezone.utc) - timedelta(days=random.randint(0, 30))).date().isoformat(),
                "vision_self": vs,
                "vision_india": vi,
                "created_at": datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 400)),
            }
        )
    return docs


def student_docs(n: int) -> list[dict]:
    docs = []
    for i in range(n):
        vs, vi = STUDENT_VISIONS[i % len(STUDENT_VISIONS)]
        level = LEVELS[i % len(LEVELS)]
        docs.append(
            {
                "respondent_type": "student",
                "name": name(),
                "email": None,
                "department": DEPARTMENTS[(i + 3) % len(DEPARTMENTS)],
                "location": random.choice(["Bangalore", "Kochi"]),
                "level": level,
                "programme": random.choice(PROGRAMMES),
                "year": random.choice(YEARS[level]),
                "vision_self": vs,
                "vision_india": vi,
                "created_at": datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 400)),
            }
        )
    return docs


