# SPARS ERP – Proforma Invoice Management System

Professional PI software for manufacturing and trading companies.

**Stack:** Next.js 15 + TypeScript + Tailwind CSS + ShadCN-style UI · Django REST Framework · PostgreSQL · JWT

---

## Demo logins (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | wendy.h@example.net | Admin@123 |
| Sales Executive | marco.r@example.org | Sales@123 |
| Accountant | iris.p@example.org | Accounts@123 |

---

## Local setup

### 1. Backend (Django)

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux

python manage.py migrate
python manage.py seed_demo
python manage.py runserver 8000
# If this hangs on OneDrive, use:
# python manage.py runserver 8000 --noreload
```

API: http://localhost:8000  
Admin: http://localhost:8000/admin/  
Health: http://localhost:8000/api/health/

SQLite is used by default for local demo. For PostgreSQL, start Docker and set `DATABASE_URL` in `.env`:

```bash
docker compose up -d
# DATABASE_URL=postgres://spars:spars@localhost:5432/spars_erp
```

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

App: http://localhost:3000

---

## Modules

- JWT login (Admin / Sales / Accountant) + forgot / reset password
- Dashboard: totals, monthly sales chart, top customers, recent PI, quick actions
- Customers: CRUD, search, Excel export, WhatsApp shortcut
- Products: CRUD, categories, HSN, GST, image, Excel export
- Proforma Invoice: auto `PI-YYYY-0001` numbering, GST (CGST/SGST vs IGST), freight/packing/discount, PDF
- PDF: logo, tax summary, amount in words, bank details, terms, signature
- WhatsApp share (PDF + link) and email with PDF attachment + templates
- Reports: daily, monthly, customer-wise
- Company settings, logo, GST, bank, database JSON backup
- Activity logs, role-based access

## Roles

| | Admin | Sales | Accountant |
|---|---|---|---|
| Users / settings / logs | Yes | — | — |
| Products write | Yes | View | View |
| Customers write | Yes | Yes | View |
| Create / edit PI | Yes | Yes | View / print / PDF |
| Reports | Yes | Yes | Yes |

GST split uses **company state vs customer state** (intra-state CGST+SGST, inter-state IGST).

**Live hosting:** Vercel (frontend) + Render (API) + Neon PostgreSQL + Cloudinary (photos/PDFs). Full steps: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## Project layout

```
backend/     Django REST API
frontend/    Next.js 15 app
docs/        API + deployment guides
docker-compose.yml
render.yaml
```

- JWT login (Admin / Sales / Accountant) + forgot / reset password
