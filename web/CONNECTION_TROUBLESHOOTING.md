# Connection error troubleshooting

If Login (or any API call) shows a **connection error**, check the following.

## 1. Use the dev server so the proxy works

The app calls **`/api`** (relative URL). Those requests are only forwarded to the backend when you run the **Vite dev server**:

```bash
cd web
npm run dev
```

- **`npm run dev`** – Vite proxies `/api` → `https://natural.selectnaturally.com`. Use this for local development.
- **`npm run preview`** or a built/deployed app – There is **no proxy**. Requests to `/api` go to the same host (e.g. `http://localhost:4173/api`), which has no backend, so you get **Failed to fetch** or 404.

**Fix:** For local testing, always use `npm run dev` when testing login/API.

## 2. Backend must be reachable

The proxy target is **`https://natural.selectnaturally.com`**. If that host is down, blocked, or has SSL issues, the request will fail.

- From the same machine where you run `npm run dev`, check:  
  `curl -i https://natural.selectnaturally.com/api/v1/user/login -X POST -H "Content-Type: application/json" -d "{}"`  
  You should get a **4xx** (e.g. validation error), not a connection/timeout error.
- Firewall/VPN/proxy can block or change requests; try from another network if needed.

## 3. CORS (production / different origin)

When the app is **built and served from another origin** (e.g. `https://myapp.com`) and the browser calls `https://natural.selectnaturally.com` directly, **CORS** applies. The backend must allow the frontend origin; otherwise the browser blocks the response.

For **local dev with `npm run dev`**, the browser only talks to the Vite server (same origin), so CORS is not involved.

## 4. What you see in the UI

- **"Cannot reach the server. Use \"npm run dev\"..."** – Usually means you’re not using the dev server, or the backend/proxy target is unreachable (see 1 and 2).
- **"Login failed."** or a message from the API – Backend was reached; check `message` for auth/validation errors.
- **"HTTP 404"** – Wrong path or proxy not applied (e.g. using preview instead of dev).

## Summary

| Scenario              | What to do                                      |
|-----------------------|-------------------------------------------------|
| Local dev, login works | Keep using `npm run dev`.                       |
| Local dev, connection error | 1) Confirm `npm run dev` is running. 2) Check backend reachable (curl above). 3) Check firewall/VPN. |
| Preview or deployed app | Use an API base URL that points at the backend and ensure CORS is configured, or serve the app from the same host as the API. |
