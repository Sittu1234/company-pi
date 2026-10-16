# Live setup – Render + Neon + Cloudinary + Vercel

Stack:

- **Frontend:** Vercel (Next.js)
- **API:** Render (Django / gunicorn)
- **Database:** Neon PostgreSQL
- **Photos + catalog PDFs:** Cloudinary
- **PI PDFs:** generated on the API (not stored)

GitHub pe pehle ye wala latest code push karo (Cloudinary + Neon wali files).

---

## 1. Neon – connection string copy

1. [console.neon.tech](https://console.neon.tech) → apna project
2. **Dashboard → Connection details**
3. **Pooled connection** select karo (`-pooler` host)
4. Connection string copy:

```
postgresql://USER:PASSWORD@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

Is string ko Render ke `DATABASE_URL` mein paste karna hai.

---

## 2. Cloudinary – URL copy

1. [cloudinary.com](https://cloudinary.com) → Dashboard
2. **Settings → Product Environment Credentials** (ya home page par API Keys)
3. ye teen values + URL copy:

```
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

Photos (logo, product image) aur catalog PDFs isi bucket mein jayenge.

---

## 3. Render – Django API

1. [dashboard.render.com](https://dashboard.render.com) → **New → Web Service**
2. GitHub repo connect / select
3. Settings:

| Field | Value |
|---|---|
| Root Directory | `backend` |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate --noinput` |
| Start Command | `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --timeout 120` |

4. **Environment** tab mein ye keys add karo:

| Key | Value |
|---|---|
| `SECRET_KEY` | lamba random string (Generate) |
| `DEBUG` | `False` |
| `DATABASE_URL` | Neon pooled connection string |
| `CLOUDINARY_URL` | `cloudinary://...` |
| `ALLOWED_HOSTS` | `backend-f870.onrender.com,.onrender.com` |
| `CORS_ORIGINS` | `https://company-pi-iota.vercel.app` |
| `FRONTEND_URL` | `https://company-pi-iota.vercel.app` |
| `EMAIL_BACKEND` | `django.core.mail.backends.smtp.EmailBackend` |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_HOST_USER` | Gmail |
| `EMAIL_HOST_PASSWORD` | Gmail app password |
| `DEFAULT_FROM_EMAIL` | `Kalpna Traders <hrbp@kalpanatraders.com>` |

5. **Create Web Service** → wait until **Live**
6. Health check: `https://YOUR-API.onrender.com/api/health/` → `{"status":"ok"}`

7. Render **Shell** se demo users:

```bash
python manage.py seed_demo
```

---

## 4. Vercel – frontend

1. [vercel.com](https://vercel.com) → Import GitHub repo
2. **Root Directory:** `frontend`
3. Framework: Next.js
4. Environment variable:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-API.onrender.com` (slash end mein nahi) |

5. Deploy
6. Jo Vercel URL mile, wapas Render pe `CORS_ORIGINS` aur `FRONTEND_URL` update karke **Redeploy**

---

## 5. Login check

App: `https://your-app.vercel.app/login`

| Role | ID | Password |
|---|---|---|
| Admin | KT001 | Admin@123 |
| Sales | KT002 | Sales@123 |
| Accounts | KT003 | Accounts@123 |

Pehle admin password change karo.

---

## 6. Common errors

| Problem | Fix |
|---|---|
| `connection SSL` / Neon timeout | Pooled (`-pooler`) URL + `sslmode=require` |
| Photos upload fail | `CLOUDINARY_URL` Render env mein hai? Redeploy |
| Frontend API error / CORS | `CORS_ORIGINS` exact Vercel origin (`https://...` no slash) |
| `DisallowedHost` | `ALLOWED_HOSTS` mein `your-api.onrender.com` |
| Catalog PDF open nahi | Cloudinary dashboard mein PDF upload `raw` resource dikhna chahiye |
| Sleep after idle (free Render) | Pehli request 30–60s lag sakti hai |

---

## Local vs live

Local: SQLite, files `backend/media/`  
Live: Neon + Cloudinary — Render env vars se auto on ho jata hai.
