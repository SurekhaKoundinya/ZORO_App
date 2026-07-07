# ZORO Backend — Django REST API

## Stack
- Python 3.11+ / Django 5.0 / Django REST Framework
- PostgreSQL 15 (primary DB)
- Redis (cache + Celery broker)
- JWT authentication via `djangorestframework-simplejwt`
- TOTP 2FA via `pyotp`
- CSV / Excel / PDF report export

## Apps

| App | Endpoint prefix | Description |
|-----|----------------|-------------|
| `authentication` | `/api/v1/auth/` | Login, logout, JWT refresh, 2FA, API keys |
| `users` | `/api/v1/users/` | User CRUD, suspend, reactivate, KYC approve |
| `kyc` | `/api/v1/kyc/` | KYC request approve / reject / resubmit |
| `wallets` | `/api/v1/wallets/` | Wallet freeze / unfreeze / risk review |
| `transactions` | `/api/v1/transactions/` | Transaction listing + flag / unflag |
| `referrals` | `/api/v1/referrals/` | Referral list + leaderboard |
| `rewards` | `/api/v1/rewards/` | Reward approve / reject / pay / approve-all |
| `reports` | `/api/v1/reports/` | Generate + download CSV / Excel / PDF |
| `system_logs` | `/api/v1/system-logs/` | Audit log (read-only) |
| `notifications` | `/api/v1/notifications/` | In-app notifications + mark read |
| `dashboard` | `/api/v1/dashboard/` | Aggregate stats + chart data |
| `settings_api` | `/api/v1/settings/` | Profile, password, roles, platform config |

## Key Endpoints

### Auth
```
POST   /api/v1/auth/login/            { email, password } → { access, refresh, user }
POST   /api/v1/auth/logout/           { refresh }
POST   /api/v1/auth/refresh/          { refresh } → { access }
GET    /api/v1/auth/me/               Current user profile
PATCH  /api/v1/auth/me/               Update profile
GET    /api/v1/auth/2fa/setup/        Get TOTP QR code
POST   /api/v1/auth/2fa/setup/        { totp_code } → enable 2FA
POST   /api/v1/auth/change-password/  { current_password, new_password, confirm_password }
GET    /api/v1/auth/api-keys/         List API keys
POST   /api/v1/auth/api-keys/         Create API key (returns raw key once)
DELETE /api/v1/auth/api-keys/{id}/    Delete API key
```

### Users
```
GET    /api/v1/users/                 List + filter (?status=active&kyc_level=2)
POST   /api/v1/users/                 Create user
GET    /api/v1/users/{id}/            User detail
PATCH  /api/v1/users/{id}/            Update user
PATCH  /api/v1/users/{id}/suspend/    Suspend user
PATCH  /api/v1/users/{id}/reactivate/ Reactivate user
PATCH  /api/v1/users/{id}/approve_kyc/ { level? }
PATCH  /api/v1/users/{id}/freeze_wallet/ Freeze all wallets
GET    /api/v1/users/stats/           Aggregate user stats
```

### KYC
```
GET    /api/v1/kyc/                   List KYC requests (?status=pending)
PATCH  /api/v1/kyc/{id}/approve/      Approve + set user.kyc_level
PATCH  /api/v1/kyc/{id}/reject/       { reason }
PATCH  /api/v1/kyc/{id}/resubmit/     { notes }
```

### Wallets
```
GET    /api/v1/wallets/               List + filter (?status=frozen)
PATCH  /api/v1/wallets/{id}/freeze/   { reason? }
PATCH  /api/v1/wallets/{id}/unfreeze/
PATCH  /api/v1/wallets/{id}/risk_review/ { risk_level, risk_score }
GET    /api/v1/wallets/stats/         Wallet aggregate stats
```

### Transactions
```
GET    /api/v1/transactions/          List + filter (?status=pending&tx_type=Deposit)
PATCH  /api/v1/transactions/{id}/flag/   { reason }
PATCH  /api/v1/transactions/{id}/unflag/
GET    /api/v1/transactions/stats/    Aggregate stats by type/status
```

### Rewards
```
GET    /api/v1/rewards/               List rewards (?status=pending)
PATCH  /api/v1/rewards/{id}/approve/
PATCH  /api/v1/rewards/{id}/reject/
PATCH  /api/v1/rewards/{id}/pay/
PATCH  /api/v1/rewards/approve_all/   Approve all pending at once
GET    /api/v1/rewards/programs/      Reward programs
```

### Reports
```
GET    /api/v1/reports/               List past reports
POST   /api/v1/reports/generate/      { report_type, format, period, date_from?, date_to? }
GET    /api/v1/reports/{id}/download/ Download file (CSV / XLSX / PDF)
```

### Dashboard
```
GET    /api/v1/dashboard/stats/       KPIs (users, volume, KYC pending …)
GET    /api/v1/dashboard/charts/      Time-series data for all charts
```

### Settings
```
GET    /api/v1/settings/profile/      Current user profile
PATCH  /api/v1/settings/profile/      Update profile fields
POST   /api/v1/settings/change-password/
GET    /api/v1/settings/roles/        List admin role users
POST   /api/v1/settings/roles/        Invite new role user
PATCH  /api/v1/settings/roles/{id}/   Update role
DELETE /api/v1/settings/roles/{id}/   Revoke role
GET    /api/v1/settings/platform/     Platform config
POST   /api/v1/settings/platform/     Update platform config
```

## Setup

```bash
cd zoro_backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env   # fill in your values

python manage.py migrate
python manage.py createsuperuser   # role=super_admin
python manage.py runserver
```

## API Docs
- Swagger UI: http://localhost:8000/api/docs/
- ReDoc:       http://localhost:8000/api/redoc/

## Docker
```bash
docker-compose -f docker/docker-compose.yml up --build
```
