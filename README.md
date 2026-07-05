# Dear Diary

Cinematic memory interface powered by **Cognee** — RAISE 2026 / WeMakeDevs hackathon.

## Structure

```
dear-diary/
├── apps/desktop/       React + Vite + Tailwind + shadcn/ui
├── services/api/       FastAPI + Cognee memory sidecar
├── packages/
│   ├── shared/         TypeScript contracts
│   └── seed/maya/      Demo dataset (34 entries)
├── scripts/            start-api.ps1, demo-reset.ps1
└── docs/planning/      Implementation plan
```

## Quick start

```bash
# 1. Clone & env
cp .env.example .env
# Edit .env → set LLM_API_KEY

# 2. API
cd services/api
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn main:app --port 8787 --host 127.0.0.1

# 3. UI
cd apps/desktop
npm install
npm run dev
```

Open http://127.0.0.1:5173

## Push to GitHub

```bash
cd dear-diary
git init
git add .
git commit -m "Dear Diary — Cognee-powered memory constellation"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dear-diary.git
git push -u origin main
```

> **Never commit** `.env` — it is gitignored. Use `.env.example` as the template.

## Cognee integration

| Verb | UI |
|------|-----|
| `remember()` | Capture orb + ingest |
| `recall()` | Witness queries + lens views |
| `improve()` | "This mattered" feedback |
| `forget()` | Demo reset |

## License

Apache-2.0
