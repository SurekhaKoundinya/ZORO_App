# ZORO Mobile App — API Integration Spec (Frontend → Backend)

This is the full contract the ZORO mobile app expects from the backend — every endpoint it calls, every field it sends, and every field it reads back. The backend (`ZORO_Backend_Combined.zip`, `apps/mobile/*`) already implements this exactly; this document exists so the backend team has a single reference instead of reading the app's screens one by one.

## Conventions

- **Base URL:** `{BASE_URL}/api/v1` — mobile-specific routes are under `/app/`, e.g. `{BASE_URL}/api/v1/app/auth/login/`. Two endpoint groups (KYC, Notifications) are **not** under `/app/` — see the "Shared endpoints" section.
- **Auth:** `Authorization: Bearer <access_token>` header on every request except the ones explicitly marked "No auth" below. Tokens are JWTs (`djangorestframework-simplejwt`).
- **Response envelope** (every endpoint, unless noted): `{ "success": true, "data": ..., "message": "OK" }`. Paginated list endpoints instead return `{ "success": true, "data": [...], "meta": { "total", "page", "limit", "totalPages" } }`.
- **Error envelope:** `{ "success": false, "message": "...", "statusCode": 400 }`, HTTP status matches `statusCode`.
- **IDs:** UUIDs (strings) everywhere except `Transaction.id`, which the app uses as a human-readable string like `TXN-1234567`.

---

## 1. Auth — `/api/v1/app/auth/`

| Method & Path | Auth | Request body | Response `data` |
|---|---|---|---|
| `POST /send-otp/` | No | `{ mobile: string, purpose?: "register"\|"login"\|"reset" (default "login") }` | `{ message: string }` |
| `POST /verify-otp/` | No | `{ mobile: string, otp: string, mode: "register"\|"login" }` | `{ access, refresh, user: {...profile shape below} }` |
| `POST /login/` | No | `{ email: string, password: string }` | **Not wrapped** — raw `{ access, refresh, user }` (matches admin login's shape) |
| `POST /refresh/` | No | `{ refresh: string }` | `{ access: string }` |
| `POST /logout/` | Yes | `{ refresh: string }` | — |
| `GET /profile/` | Yes | — | `{ id, name, email, mobile, avatar, country, joinDate, walletAddress, walletId, referralCode, balance, transactionCount }` |
| `POST /profile/` | Yes | `{ name?, email?, mobile?, country?, avatar? }` (all optional, partial update) | same shape as `GET /profile/` |
| `POST /set-pin/` | Yes | `{ pin: string (exactly 4 digits) }` | — |
| `POST /change-password/` | Yes | `{ current_password, new_password, confirm_password }` | — |
| `POST /send-password-reset-otp/` | No | `{ mobile: string, purpose: "reset" }` | `{ message }` |
| `POST /verify-password-reset-otp/` | No | `{ mobile: string, otp: string }` | `{ reset_token: string }` (signed, expires in 10 min) |
| `POST /reset-password/` | No | `{ reset_token: string, new_password: string }` | — |

**Important:** `send-otp` does **not** know register vs. login intent (the app doesn't know it yet either at that point) — the same OTP code works for either, and `verify-otp`'s `mode` decides what happens. Don't gate `send-otp` on whether the number is already registered.

**Registration flow:** `send-otp` → `verify-otp(mode:"register")` (creates the account + a ZOR wallet, returns tokens immediately) → `POST /profile/` (fills in name/email/country) → `POST /set-pin/`.

---

## 2. Wallet — `/api/v1/app/wallets/`

| Method & Path | Auth | Request body | Response `data` |
|---|---|---|---|
| `GET /dashboard/` | Yes | — | `{ id, balance, referralRewards, referralStatus: "Locked"\|"Unlocked", unlockInDays, dailyLimit, dailyUsed }` |
| `GET /address/` | Yes | — | `{ address: string }` |
| `GET /` | Yes | — | list of wallets (paginated) — today always exactly one ZOR wallet per user |

Every user has exactly **one** wallet, currency `ZOR`. There is no multi-currency wallet selection in this app.

---

## 3. Transactions — `/api/v1/app/transactions/`

| Method & Path | Auth | Request body | Response `data` |
|---|---|---|---|
| `GET /` | Yes | — | paginated list of `{ id, type: "sent"\|"received", status, counterparty, address, amount, hash, createdAt }` |
| `GET /{id}/` | Yes | — | single transaction, same shape |
| `POST /preview/` | Yes | `{ toAddress: string, amount: number }` | `{ receiver: {name}, address, amount, sender: {name, wallet}, isRecent: bool }` |
| `POST /transfer/` | Yes | `{ toAddress: string, amount: number, pin: string, note?: string }` | — (message only) |
| `GET /user-by-address/?address=` | Yes | — | `{ name, address, avatar }` |
| `POST /scan-qr/` | Yes | `{ qrData: string }` | `{ name, walletAddress }` |
| `GET /recents/` | Yes | — | array of `{ name, address, avatar }` |
| `POST /recents/` | Yes | `{ address: string }` | — |

`transfer` validates, in order: PIN correct → recipient address exists → sufficient balance → daily limit not exceeded. All failures return `success:false` with a human-readable `message` (e.g. `"Incorrect transaction PIN"`, `"Insufficient balance"`).

---

## 4. Rewards — `/api/v1/app/rewards/`

| Method & Path | Auth | Request body | Response `data` |
|---|---|---|---|
| `GET /` | Yes | — | list of `{ id, type, amount, status, date }` |
| `GET /programs/` | Yes | — | list of `{ id, name, description, amount, currency }` |
| `POST /{id}/claim/` | Yes | — | — (credits the wallet, sets status to `paid`) |

---

## 5. Referrals — `/api/v1/app/referrals/`

| Method & Path | Auth | Request body | Response `data` |
|---|---|---|---|
| `GET /` | Yes | — | `{ referralCode, totalUsers, successfulReferrals, totalRewards, pendingRewards, rewardPerUser, referredUsers: [{name, joinedAt, status, reward}] }` |

---

## 6. Market — `/api/v1/app/market/`

| Method & Path | Auth | Request body | Response `data` |
|---|---|---|---|
| `GET /` | Yes | — | array of `{ id, name, symbol, image, accent, price, priceChangePercentage24h }` |

---

## 7. Bank accounts — `/api/v1/app/bank-accounts/`

| Method & Path | Auth | Request body | Response `data` |
|---|---|---|---|
| `GET /` | Yes | — | list of `{ id, bankName, holderName, accountNumber, ifsc, primary, created_at }` |
| `POST /` | Yes | `{ bankName, holderName, accountNumber, ifsc }` | same shape, single object |

---

## 8. Shared endpoints (already exist on the admin backend — do not duplicate)

| Method & Path | Auth | Request body | Notes |
|---|---|---|---|
| `GET /api/v1/kyc/` | Yes | — | Returns the logged-in user's own KYC requests (list). Take the first item as "current status." |
| `POST /api/v1/kyc/` | Yes | `{ level: number }` (1, 2, or 3 — **not** the string `"Level 2"`) | Real document upload isn't wired up on the app side yet; only `level` is sent today. |
| `GET /api/v1/notifications/` | Yes | — | List, scoped to the logged-in user. |
| `PATCH /api/v1/notifications/{id}/mark_read/` | Yes | — | |
| `PATCH /api/v1/notifications/mark_all_read/` | Yes | — | |

---

## What the frontend still needs from the backend team

- **A deployed base URL** to plug into `configureApiBaseUrl()` in `src/store/api.js` (currently points at `localhost`/`10.0.2.2` for local dev only).
- **A real SMS provider** — OTP codes currently only reach the server log, not an actual phone. The frontend has no dependency on *how* this is sent, only that `send-otp` succeeds and the same code the user receives validates in `verify-otp`.
- **Confirmation of JWT expiry** the team wants in production (`SIMPLE_JWT.ACCESS_TOKEN_LIFETIME` is currently 15 min in `production.py`, 8 hours in `development.py`) — the app's `api.js` already auto-refreshes on a 401, but very short-lived tokens mean more refresh calls.
