# Dialogue with Future Entrepreneurs

Submission and insight platform for the Office of Academics, JAIN (Deemed-to-be University).
React (Vite) + FastAPI + MongoDB. Replaces the four standalone HTML files (two forms, two dashboards)
with one application.

| Route | What it is |
| --- | --- |
| `/` | Redirects to `/student` — there is no separate home page |
| `/student` | Student dialogue — welcome cover, then the 5-step form |
| `/faculty` | Faculty dialogue — welcome cover, then the 5-step form |
| `/admin` | One dashboard, with a **Faculty / Student toggle** in the header |

`/student` and `/faculty` are the only links you share. Each opens on its own welcome cover —
separate artwork and copy for each audience — and one click starts the form. Anyone returning to a
saved draft skips the cover and lands back on their answers. There is no home page: `/` simply
redirects to the student dialogue, and the confirmation screen sends people back to the cover of the
dialogue they just answered.

---

## Run locally

**1. MongoDB** — anything reachable at `MONGODB_URL` (local server, Atlas, Docker):

```bash
docker run -d -p 27017:27017 --name dialogue-mongo mongo:7
```

**2. Backend**

```bash
cd backend
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
cp .env.example .env          # set ADMIN_PASSWORD and JWT_SECRET
.venv/bin/python seed.py      # optional: sample responses to look at
.venv/bin/uvicorn app.main:app --reload --port 8000
```

**3. Frontend**

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173, /api proxied to :8000
```

> **No MongoDB to hand?** Set `USE_MOCK_DB=1` (and `SEED_MOCK=1` for sample data) in `backend/.env`.
> The API then runs against an in-memory stand-in — good for demos and screenshots, **not** for
> production: nothing is persisted.

---

## Configuration (`backend/.env`)

| Key | Purpose |
| --- | --- |
| `MONGODB_URL`, `MONGODB_DB` | Database connection |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Dashboard login |
| `ADMIN_PASSWORD_HASH` | bcrypt hash; **takes priority** over the plain password — use this in production |
| `JWT_SECRET`, `JWT_EXPIRE_MINUTES` | Session signing (`python -c "import secrets;print(secrets.token_urlsafe(48))"`) |
| `CORS_ORIGINS` | Comma-separated browser origins allowed to call the API |
| `USE_MOCK_DB`, `SEED_MOCK` | Dev only — in-memory database, sample data |

Generate a password hash:

```bash
python -c "import bcrypt;print(bcrypt.hashpw(b'YOUR-PASSWORD', bcrypt.gensalt()).decode())"
```

---

## API

Public:

- `GET  /api/meta` — departments, semesters, locations, levels, years by level
- `POST /api/responses/student`
- `POST /api/responses/faculty`

Dashboard (Bearer token from login):

- `POST   /api/admin/login`
- `GET    /api/admin/session`
- `GET    /api/admin/overview` — response counts per audience
- `GET    /api/admin/analytics?respondent_type=faculty|student`
- `GET    /api/admin/responses?respondent_type=…&q=…&scope=…&page=…`
- `DELETE /api/admin/responses/{id}`
- `GET    /api/admin/export?respondent_type=…` — multi-sheet `.xlsx`

Interactive docs at `/docs` while the API is running.

---

## Analytics

All scoring runs on the server (`backend/app/analytics/`) so the dashboard, the Excel export and any
future report agree with each other. The taxonomy was lifted from the original dashboards without
changes, so numbers stay comparable with earlier reports:

- **165 themes** — 60 for "my future", 105 for "India's future" (`data/theme_keywords.json`)
- **40 semantic rules** — natural-language paraphrases like "less plastic", "protect nature"
  (`data/semantic_rules.json`)
- **15 research categories** for faculty research profiles (`data/research_categories.json`)

Alongside the themes, each dashboard load computes:

- **Participation over time** — one point per day for the trailing 30 days, drawn as a wave
- **Depth of reflection** — average words per answer, the longest reflection, and a four-band
  distribution of how much people wrote
- **Shared vocabulary** — the words the cohort reaches for, counted once per response so a single
  long answer cannot carry the list

Scoring: 3 points per multi-word phrase, 1 per single word, +5 for a semantic rule. Every theme
scoring at least 38% of the best score is counted, so one response can carry several themes. The
donuts count each response once, under its single strongest theme. A response that matches nothing
gets a readable "Emerging Aspiration: …" label built from its own words rather than dropping into an
"Other" bucket.

To change the taxonomy, edit the JSON files — nothing else needs to change.

---

## What was fixed from the original HTML files

**Data**

- Responses go to MongoDB through a validated API. The old forms used `fetch(..., {mode:'no-cors'})`
  to a Google Apps Script, which cannot read the response — a failed submit still showed
  "thank you". Submissions now fail loudly and can be retried.
- Dashboards read from the database, not from `localStorage` in one browser. Previously a dashboard
  only ever showed responses submitted on that same device.
- Excel export is generated server-side over all responses, not over whatever the browser had cached.

**Forms**

- First invalid field is focused and scrolled to; errors clear as you type; every field carries
  `aria-invalid` / `aria-describedby`.
- Department combobox: full keyboard support (arrows, Enter, Escape), and the
  "Others (Please specify)" path no longer wipes the value while you type in it.
- "Departmnet of Art and Design" typo corrected in the department list.
- Draft autosave is debounced and reported quietly in the header — the old build fired a toast on
  every keystroke, and claimed "Draft saved" on an untouched form.
- Restored drafts are announced, with a one-click "start fresh".
- Progress steps are clickable for steps already completed.
- Submit is single-fire; a re-validation pass runs before send, so nothing invalid reaches the API.
- Optional email field on both forms, for follow-up.
- Meeting date cannot be set in the future.
- Closing the tab mid-form warns about unsaved work.

**Dashboard**

- One dashboard with a Faculty / Student toggle instead of two separate files.
- Login required (JWT); the old dashboards were open to anyone with the file.
- Search, filter, pagination and delete on the response list; the old list rendered every response
  into the DOM at once.
- Removed the `setInterval(load, 1500)` re-render loop, which re-parsed and re-analysed everything
  twice a second.

**Design**

- The JAIN lockup appears on every screen: the supplied artwork on paper backgrounds, and a
  recoloured version (white roundel, navy JGi, gold dot) on the navy covers. Both files live in
  `frontend/public/`, alongside the favicon cut from the JGi mark.
- The public forms use a firmer, more graphic treatment of the same navy / gold / paper palette:
  monospace micro-labels, gold marker highlights, thick navy rules and hard offset shadows. Each form
  opens on a welcome cover with its own inline illustration, then the stepped form.
- All artwork is drawn inline as SVG — step bands, cover panels, persona icons. Nothing is fetched
  from an image host, so nothing renders empty, and there are no emoji anywhere in the interface.
- The dashboard now wears the same editorial treatment as the forms — monospace micro-labels, gold
  marker highlights, hard navy rules and offset shadows — so signing in does not feel like arriving
  at a different product. Confirmation screens keep the navy cover treatment, including the student
  persona card.
- Chart colours are checked, not eyeballed: the categorical slots sit inside the OKLCH lightness
  band, clear the chroma floor and keep adjacent pairs separable under colour-vision deficiency. A
  ninth series is folded into “Other” rather than given a new hue, bars carry one hue rather than a
  decorative gradient, and the wave chart uses monotone interpolation so the curve never dips below
  a day that recorded nothing. Every chart is readable without colour: the wave carries a table of
  its daily figures, and the bars and tiles are labelled directly.

**Both**

- Reduced-motion support, visible focus rings, skip links, real `<label>` associations.
- Responsive from 390px up; no horizontal scroll.

---

## Deploy (juooa.cloud VPS)

```bash
sudo mkdir -p /var/www/dialogue-futures
sudo chown -R $USER /var/www/dialogue-futures
git clone <repo> /var/www/dialogue-futures

cp deploy/dialogue-futures.service /etc/systemd/system/
cp deploy/nginx.conf /etc/nginx/sites-available/dialogue-futures
ln -s /etc/nginx/sites-available/dialogue-futures /etc/nginx/sites-enabled/

cd /var/www/dialogue-futures/backend
cp .env.example .env    # set real secrets, CORS_ORIGINS=https://dialogue.juooa.cloud

bash deploy/deploy.sh
sudo systemctl enable --now dialogue-futures
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d dialogue.juooa.cloud
```

The service listens on `127.0.0.1:8071`; nginx serves `frontend/dist` and proxies `/api`.

**Alternative — single service, no nginx static block:** run `npm run build` and copy
`frontend/dist` to `backend/static/`. FastAPI then serves the SPA itself and nginx only needs to
proxy everything to `:8071`.

### Production checklist

- [ ] `ADMIN_PASSWORD_HASH` set (not the plain `ADMIN_PASSWORD`)
- [ ] `JWT_SECRET` replaced with a fresh random value
- [ ] `CORS_ORIGINS` set to the real domain only
- [ ] `USE_MOCK_DB` and `SEED_MOCK` unset or `0`
- [ ] MongoDB has authentication enabled and is not exposed publicly
- [ ] TLS issued and auto-renewing
#   D i a l o g u e - w i t h - F u t u r e - E n t r e p r e n e u r s 
 
 