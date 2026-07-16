"""Shared helpers for the auth views — kept out of views.py so the "how do we
create a brand-new app user" logic exists in exactly one place."""

import secrets
from apps.users.models import User
from apps.wallets.models import Wallet
from apps.mobile.models import AppProfile


def generate_zor_address():
    # ponytail: a plausible-looking demo address, not a real on-chain keypair —
    # there is no blockchain behind the ZOR token yet. Swap this for real
    # wallet/keypair generation if ZOR ever becomes an actual on-chain asset.
    return '0xZR' + secrets.token_hex(20)


def provision_app_user(phone):
    """
    Create a brand-new mobile-app user from just a verified phone number
    (name/email are filled in afterwards by ProfileSetupScreen -> auth/profile/).
    Creates the three rows every app user needs: User, AppProfile (PIN +
    daily limit), and their one ZOR wallet — atomically, so the app can never
    see a half-provisioned account.
    """
    from django.db import transaction

    with transaction.atomic():
        user = User(phone=phone, role='user', status='active')
        user.set_unusable_password()  # OTP is the credential; a password can be added later via settings
        user.save()

        AppProfile.objects.create(user=user)

        Wallet.objects.create(
            owner=user, address=generate_zor_address(),
            network='Zoro', currency='ZOR',
        )
    return user
