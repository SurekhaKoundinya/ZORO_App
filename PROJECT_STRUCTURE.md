# ZORO Backend — Combined Project Structure

One Django project, one database, two API surfaces. This was rebuilt to
match the actual ZORO mobile app's screens (not a generic guess) — see
`apps/mobile/__init__.py` for the full rationale, and the mobile repo's
`src/store/mockApi.js` for the exact contract every endpoint here mirrors.

- **Admin portal API** — `apps/authentication`, `apps/users`, `apps/kyc`,
  `apps/wallets`, `apps/transactions`, `apps/referrals`, `apps/rewards`,
  `apps/reports`, `apps/system_logs`, `apps/notifications`, `apps/dashboard`,
  `apps/settings_api`. Untouched except two small **additive** field
  additions (see below) — nothing existing was renamed, removed, or had its
  behavior changed.
- **Mobile app API** — `apps/mobile/*` (new). Reuses the admin's models for
  everything that already existed there (User, Wallet, Transaction, KYC,
  Reward, Referral, Notification) and adds four new models for what didn't
  (transaction PIN, OTP codes, recent contacts, bank accounts).

```
zoro_backend/
├── manage.py
├── requirements.txt
├── PROJECT_STRUCTURE.md          ← this file
├── zoro_backend/                 project settings / root urls
│   ├── settings/{base,development,production}.py
│   └── urls.py                   mounts both /api/v1/... (admin) and /api/v1/app/... (mobile)
├── utils/                        shared: pagination, responses, permissions, storage, exceptions
└── apps/
    ├── authentication/  users/  kyc/  wallets/  transactions/   ← admin portal
    ├── referrals/  rewards/  reports/  system_logs/                (additive edits noted below)
    ├── notifications/  dashboard/  settings_api/
    └── mobile/                                                   ← NEW: mobile app API
        ├── models.py              AppProfile (PIN + daily limit), OTPRequest,
        │                          RecentContact, BankAccount
        ├── admin.py               registers those 4 models in Django admin
        ├── urls.py                mounted at /api/v1/app/
        ├── auth/                  OTP register/login, email+password login,
        │                          set-pin, OTP-based password reset
        ├── wallets/               my ZOR wallet — dashboard, deposit address
        ├── transactions/          history + P2P transfer by wallet address,
        │                          QR resolve, recent contacts
        ├── rewards/               my rewards + active programs + self-claim
        ├── referrals/             my code, referred users, totals
        ├── market/                live coin prices (CoinGecko, cached) —
        │                          no admin-side equivalent at all
        ├── bank/                  linked bank accounts
        └── dashboard/             optional combined home-screen endpoint
```

## Two additive edits to admin's own models

Needed so the mobile app's P2P transfers and ZOR token fit inside the
existing `Wallet`/`Transaction` tables instead of new ones:

- `apps/wallets/models.py` — added `'ZOR'` to `CURRENCIES` and `'Zoro'` to
  `NETWORKS`. Every other choice is untouched.
- `apps/transactions/models.py` — added `'Zoro'` to `NETWORKS`, plus two new
  nullable fields: `direction` (`sent`/`received`) and `counterparty` (FK to
  `User`). Both are blank for every existing admin-side Deposit/Withdrawal/
  Swap row — only the mobile app's P2P transfers populate them.

Both are migrations `0002_*` in their respective apps — additive only, no
data migration needed, nothing existing changes shape.

## Why this design (read this before changing anything)

1. **Single source of truth.** A user's KYC level, wallet balance, and
   transaction status must be identical whether the admin panel or the
   mobile app reads it — so the mobile app never gets its own copy of
   `User`/`Wallet`/`Transaction`. It's the same tables, different endpoints.
2. **KYC and Notifications are reused untouched, not duplicated** — both were
   already scoped to `request.user` for non-admin users
   (`apps/kyc/views.py::KYCViewSet.get_queryset`,
   `apps/notifications/views.py::NotificationViewSet.get_queryset`). The app
   calls `/api/v1/kyc/` and `/api/v1/notifications/` directly.
3. **Auth is split by role, not by app.** `/api/v1/auth/login/` (admin,
   email+password) rejects `role='user'` accounts. `/api/v1/app/auth/*`
   (mobile) supports mobile+OTP register/login (primary path — no password
   is ever collected at signup) *and* email+password login for accounts that
   have one, and rejects suspended/banned accounts either way. Every attempt,
   from either surface, writes to the same `LoginAttempt` table.
4. **P2P transfers are same-database, not on-chain.** ZOR has no real
   blockchain behind it (see `apps/mobile/auth/services.py`'s address
   generator) — a transfer between two ZOR wallets is a single DB
   transaction that debits one `Wallet.balance` and credits another,
   writing a mirrored `sent`/`received` `Transaction` row on each side. This
   is different from admin's Withdrawal/Deposit/Swap rows, which represent
   real external-chain activity admin ops reviews.
5. **Reward claiming credits the wallet directly** (self-service, matching
   the app's UX) rather than requiring the admin-approval step
   `apps/rewards` already has — see the `ponytail:` comment in
   `apps/mobile/rewards/views.py` if that gate needs tightening later.

## Known limitations (deliberate, not oversights — see the `ponytail:` comments in code)

- **No SMS gateway wired in.** OTP codes are logged (`logger("zoro.otp")`),
  never actually texted. Wire a real provider (Twilio/MSG91/etc.) into
  `apps/mobile/models.py::OTPRequest.send()` before shipping to real users.
- **KYC document upload isn't wired end-to-end.** The app's KycUploadScreen
  currently simulates document capture (no real camera/file picker), so
  `submitKyc()` only sends the KYC level today — real files will flow once
  that screen captures them (the backend endpoint already accepts them).
- **ZOR has no live market.** Its "price" in `apps/mobile/market/views.py` is
  a static reference constant, not a real market feed, unlike the other
  coins (which pull live prices from CoinGecko's free public API).
- **Referral "successful" vs "total"** are the same count today (a Referral
  row is created at signup, not on some later conversion event) — see the
  docstring in `apps/mobile/referrals/views.py` for what would need to change
  to make them diverge.

## Setup

Same as before — see `README.md`, plus `python manage.py migrate` to apply
the two new migrations (`mobile_app.0001_initial`,
`transactions.0002_transaction_counterparty_transaction_direction_and_more`,
`wallets.0002_alter_wallet_currency_alter_wallet_network`). No new
environment variables or Python dependencies were introduced.

## Connecting the actual mobile app

The mobile app's `src/store/mockApi.js` (its self-contained fake backend) has
a real counterpart at `src/store/api.js` in the app repo, exporting the exact
same function names/signatures so no screen needs to change — just swap the
import in each screen from `"../../store/mockApi"` to `"../../store/api"`
once this backend is deployed and `configureApiBaseUrl()` points at it.
`src/context/AuthContext.jsx` was updated to work with either module
unchanged (see that file's top comment).
