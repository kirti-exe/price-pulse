# Price Pulse

A price comparison and price-history tracker for Indian online stores: search products, compare prices across stores, see price history charts, and get a "good deal or wait?" verdict.

**Live demo:** [YOUR-VERCEL-URL]
(The backend sleeps when idle, so the first load can take up to a minute.)

> Prices in the demo are **simulated**. The project does not scrape any store.

![Home page](docs/home.png)

![Product page](docs/product.png)

## Features

- Search, category filters, sorting, and "show more"
- Per-product price history chart, with lowest, average, and highest stats
- Deal verdict ("Great deal", "Wait for a drop") calculated from the history
- Price drop alerts by email
- User accounts and a personal watchlist
- Admin page to add and delete products
- Dark mode
- Prices refreshed on a schedule

## Tech stack

| Part | Technology |
|---|---|
| Frontend | React, Vite, React Router, Recharts |
| Backend | Node.js, Express |
| Database | PostgreSQL (Neon) |
| Auth | bcrypt password hashing, JWT |
| Scheduling | GitHub Actions calling a protected API route |
| Hosting | Vercel (frontend), Render (backend) |

## How it works

1. The server stores products, stores, current listings, and a row per recorded price.
2. A scheduled job fetches new prices (simulated for now) and adds history rows.
3. The API returns each product with its listings and a chart-ready history.
4. After each update, alerts whose target price was reached are emailed.

The price source is a single swappable function per store, so a real affiliate API can be plugged in without touching the rest.

## Run locally

Requirements: Node.js 20+ and a PostgreSQL database (for example a free Neon project).

```bash
git clone [YOUR-REPO-URL]
cd price-pulse

# Backend
cd server
npm install
cp .env.example .env     # then fill in the values
npm run seed
npm run add-samples
npm run dev

# Frontend (new terminal)
cd client
npm install
npm run dev
```

Environment variables (`server/.env`):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `ADMIN_KEY` | Protects admin routes |
| `JWT_SECRET` | Signs login tokens |
| `FAKE_PRICES` | `true` to use simulated prices |
| `APP_ENV` | `development` allows the destructive seed script |
| `CLIENT_URL` | Allowed frontend origin (CORS) |

The frontend reads `VITE_API_URL` (defaults to `http://localhost:5000`).

## Limitations

- Prices are simulated. Real data needs affiliate API access.
- Alert emails use a test mailbox unless SMTP settings are configured.
- No password reset or email verification yet.
