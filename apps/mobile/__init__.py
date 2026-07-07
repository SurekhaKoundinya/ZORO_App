"""
apps.mobile — Backend API for the ZORO MOBILE APP (end users), living in the
SAME Django project as the admin portal backend so both share one database
and one JWT secret.

This package was rebuilt to match the actual React Native app's screens
(src/screens/**, src/store/mockApi.js in the zoro_mobile_app repo) field for
field, rather than a generic "crypto wallet" guess. Where the app needs
something the admin portal's models never had — a transaction PIN, OTP
codes, a P2P "send by address" directory, linked bank accounts — those live
in this app's own models.py (see below). Everything else (wallet balance,
transaction history, KYC, rewards, referrals, notifications) still reuses
the admin's existing models directly; there is exactly one `User` table,
one `Wallet` table, one `Transaction` table, seen from two angles.

Folder layout:
    apps/mobile/
        models.py       AppProfile (PIN + daily limit), OTPRequest,
                         RecentContact, BankAccount — mobile-only data,
                         each FK'd back to apps.users.User.
        auth/            mobile+OTP register/login, email+password login,
                         set transaction PIN, OTP-based password reset.
        wallets/         single "my ZOR wallet" dashboard (reuses
                         apps.wallets.Wallet, filtered to the user's one
                         ZOR-currency wallet — see wallets/views.py).
        transactions/    history, P2P transfer by wallet address (with PIN
                         + daily-limit checks), QR resolve, recent contacts.
        rewards/         my rewards + active programs + self-service "claim".
        referrals/       my code, who I referred, totals.
        market/          live coin prices (CoinGecko, cached) for the
                         Market tab — no equivalent in the admin portal at all.
        bank/            linked bank accounts (list/add).
        dashboard/       one aggregate "home screen" endpoint.

Endpoints intentionally NOT duplicated here (the app calls these directly):
    /api/v1/kyc/            apps.kyc — already scoped to "own requests" for any
                             non-agent authenticated user (see KYCViewSet.get_queryset)
    /api/v1/notifications/  apps.notifications — already scoped to request.user

Two small, purely additive fields were added to the admin's own models to
support P2P transfers and the ZOR token (see apps/wallets/models.py CURRENCIES/
NETWORKS and apps/transactions/models.py `direction`/`counterparty`) — nothing
existing was renamed or removed, so admin ops screens work exactly as before.

All mobile endpoints are mounted under /api/v1/app/ (see apps/mobile/urls.py
and the root zoro_backend/urls.py include).
"""
