# SPARS ERP – REST API

Base URL (local): `http://localhost:8000`

All authenticated routes require:

```
Authorization: Bearer <access_token>
```

Tokens expire in 12 hours. Refresh at `POST /api/auth/refresh/` with `{ "refresh": "..." }`.

---

## Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login/` | No | `{ email, password }` → `{ access, refresh, user }` |
| POST | `/api/auth/logout/` | Yes | `{ refresh }` blacklists refresh token |
| GET | `/api/auth/me/` | Yes | Current user |
| POST | `/api/auth/refresh/` | No | `{ refresh }` → new access |
| POST | `/api/auth/forgot-password/` | No | `{ email }` – in DEBUG also returns `reset_url` |
| POST | `/api/auth/reset-password/` | No | `{ token, password }` |
| CRUD | `/api/auth/users/` | Admin | Manage users |

## Customers

| Method | Path | Notes |
|---|---|---|
| GET/POST | `/api/customers/` | Search: `?search=`, filter `state`, `city` |
| GET/PUT/PATCH/DELETE | `/api/customers/{id}/` | |
| GET | `/api/customers/lookup/` | Compact list for PI dropdown |
| GET | `/api/customers/export/` | Excel download |

Write: Admin + Sales. Read: all roles.

## Products

| Method | Path | Notes |
|---|---|---|
| CRUD | `/api/products/` | Multipart for image |
| GET | `/api/products/export/` | Excel |
| CRUD | `/api/products/categories/` | |

Write: Admin only.

## Proforma invoices

| Method | Path | Notes |
|---|---|---|
| GET/POST | `/api/invoices/` | POST body includes `items_data` |
| GET/PUT/PATCH/DELETE | `/api/invoices/{id}/` | Delete: Admin |
| GET | `/api/invoices/next_number/` | Preview next `PI-YYYY-NNNN` |
| GET | `/api/invoices/{id}/pdf/` | `?inline=1` for print |
| POST | `/api/invoices/{id}/email/` | `{ to, subject, message }` attaches PDF |
| GET | `/api/invoices/{id}/whatsapp/` | Returns `wa.me` URL, share link, PDF URL |

### Create PI payload

```json
{
  "customer": 1,
  "pi_date": "2026-08-19",
  "valid_till": "2026-09-03",
  "status": "draft",
  "freight_charges": 500,
  "packing_charges": 200,
  "discount": 0,
  "notes": "",
  "terms": "",
  "items_data": [
    {
      "product": 1,
      "product_name": "MS Bolt M12",
      "hsn_code": "7318",
      "unit": "PCS",
      "qty": 100,
      "rate": 12.5,
      "gst": 18
    }
  ]
}
```

`pi_number` is generated server-side: `PI-2026-0001`.

## Reports

| GET | Description |
|---|---|
| `/api/reports/dashboard/` | KPI cards, graph, top customers, recent PI |
| `/api/reports/daily/?date=YYYY-MM-DD` | Daily PI count, sales, customers |
| `/api/reports/monthly/?year=2026&month=8` | Monthly sales + top customers |
| `/api/reports/customers/?customer=ID` | Customer-wise PI and purchase value |

## Company

| Method | Path | Auth |
|---|---|---|
| GET | `/api/company/settings/` | Any logged-in user |
| PUT | `/api/company/settings/` | Admin (multipart for logo) |
| GET | `/api/company/backup/` | Admin – JSON dump |

## Activity

| GET | `/api/activity/logs/` | Admin |

## Health

`GET /api/health/` → `{ "status": "ok", "app": "SPARS ERP" }`
