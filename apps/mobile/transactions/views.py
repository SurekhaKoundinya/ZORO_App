"""
P2P "send ZOR to another ZORO user" engine. Matches mockApi.js's WALLET
section: transferPreview, transfer, getUserByAddress, scanQr, getRecents,
addRecent, plus the plain transaction-history list/detail.

Money-movement rule: a transfer only ever happens between two ZOR wallets
that already exist in this same database — there is no external blockchain
behind ZOR, so `transfer()` below is a same-request, same-DB-transaction
balance move (unlike apps.transactions' Withdrawal/Deposit/Swap rows, which
represent real on-chain activity reviewed by admin ops).
"""

import secrets
from decimal import Decimal, InvalidOperation

from django.db import transaction as db_transaction
from rest_framework import viewsets
from rest_framework.views import APIView

from utils.responses import success_response, error_response
from apps.transactions.models import Transaction
from apps.wallets.models import Wallet
from apps.mobile.models import AppProfile, RecentContact
from apps.mobile.wallets.views import get_or_create_zor_wallet
from .serializers import AppTransactionSerializer


def _find_zor_wallet(address):
    return Wallet.objects.filter(address__iexact=address, currency='ZOR').select_related('owner').first()


def _parse_amount(raw):
    try:
        amount = Decimal(str(raw))
    except (InvalidOperation, TypeError):
        return None
    return amount if amount > 0 else None


class AppTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/v1/app/transactions/        GET — my history (getTransactionList)
    /api/v1/app/transactions/{id}/   GET — getTransactionById (looked up by tx_id, e.g. "TXN-Z1842")

    Read-only: transactions are only ever created through TransferView below.
    """
    serializer_class = AppTransactionSerializer
    filterset_fields = ['status', 'direction']
    lookup_field = 'tx_id'
    lookup_url_kwarg = 'tx_id'

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).select_related('counterparty')


class TransferPreviewView(APIView):
    """POST /api/v1/app/transactions/preview/ { toAddress, amount } -> confirm-screen preview."""

    def post(self, request):
        to_address = request.data.get('toAddress', '')
        amount = _parse_amount(request.data.get('amount'))
        if amount is None:
            return error_response('Enter an amount greater than 0')

        receiver_wallet = _find_zor_wallet(to_address)
        if not receiver_wallet:
            return error_response("Recipient wallet address not found", status_code=404)
        if receiver_wallet.owner_id == request.user.id:
            return error_response("You can't send ZOR to your own wallet")

        my_wallet = get_or_create_zor_wallet(request.user)
        if amount > my_wallet.balance:
            return error_response('Insufficient balance for this transfer')

        is_recent = RecentContact.objects.filter(owner=request.user, contact=receiver_wallet.owner).exists()
        return success_response(data={
            'receiver': {'name': receiver_wallet.owner.full_name},
            'address': receiver_wallet.address,
            'amount': float(amount),
            'sender': {'name': request.user.full_name, 'wallet': my_wallet.address},
            'isRecent': is_recent,
        })


class TransferView(APIView):
    """
    POST /api/v1/app/transactions/transfer/ { toAddress, amount, pin, note }

    Checks (in order, matching the app's own validation order): PIN correct,
    valid recipient, sufficient balance, daily limit not exceeded. On
    success, moves the balance and writes a 'sent' row for the sender and a
    mirrored 'received' row for the recipient — both referencing the same
    tx_hash, in one DB transaction.
    """

    def post(self, request):
        to_address = request.data.get('toAddress', '')
        note = request.data.get('note', '') or ''
        amount = _parse_amount(request.data.get('amount'))
        if amount is None:
            return error_response('Enter an amount greater than 0')

        profile, _ = AppProfile.objects.get_or_create(user=request.user)
        if profile.pin_hash and not profile.check_pin(request.data.get('pin', '')):
            return error_response('Incorrect transaction PIN', status_code=400)

        receiver_wallet = _find_zor_wallet(to_address)
        if not receiver_wallet:
            return error_response('Recipient wallet address not found', status_code=404)
        if receiver_wallet.owner_id == request.user.id:
            return error_response("You can't send ZOR to your own wallet")

        sender_wallet = get_or_create_zor_wallet(request.user)
        if amount > sender_wallet.balance:
            return error_response('Insufficient balance', status_code=400)

        already_spent = profile.get_daily_spent()
        if already_spent + amount > profile.daily_limit:
            return error_response(
                f'This transfer would exceed your daily limit ({profile.daily_limit} ZOR)', status_code=400
            )

        tx_hash = '0x' + secrets.token_hex(20)
        with db_transaction.atomic():
            sender_wallet.balance -= amount
            sender_wallet.total_out += amount
            sender_wallet.save(update_fields=['balance', 'total_out', 'last_activity'])

            receiver_wallet.balance += amount
            receiver_wallet.total_in += amount
            receiver_wallet.save(update_fields=['balance', 'total_in', 'last_activity'])

            Transaction.objects.create(
                user=request.user, wallet=sender_wallet, tx_type='Transfer', amount=amount,
                currency='ZOR', network='Zoro', status='completed', tx_hash=tx_hash,
                notes=note, direction='sent', counterparty=receiver_wallet.owner,
            )
            Transaction.objects.create(
                user=receiver_wallet.owner, wallet=receiver_wallet, tx_type='Transfer', amount=amount,
                currency='ZOR', network='Zoro', status='completed', tx_hash=tx_hash,
                notes=note, direction='received', counterparty=request.user,
            )
            profile.add_daily_spend(amount)

        return success_response(message='Transfer successful')


class UserByAddressView(APIView):
    """GET /api/v1/app/transactions/user-by-address/?address=0xZR... -> recipient lookup for SendAddressScreen."""

    def get(self, request):
        wallet = _find_zor_wallet(request.query_params.get('address', ''))
        if not wallet:
            return error_response("User not found", status_code=404)
        return success_response(data={'name': wallet.owner.full_name, 'address': wallet.address, 'avatar': wallet.owner.avatar})


class ScanQrView(APIView):
    """
    POST /api/v1/app/transactions/scan-qr/ { qrData }

    Real QR codes just encode the recipient's wallet address as plain text
    (see ReceiveScreen — it renders `address` straight into a QR image), so
    this just resolves whatever string the camera decoded.
    """

    def post(self, request):
        address = str(request.data.get('qrData', '')).strip()
        wallet = _find_zor_wallet(address)
        if not wallet:
            return error_response("That wallet address doesn't exist on ZORO.", status_code=404)
        return success_response(data={'name': wallet.owner.full_name, 'walletAddress': wallet.address})


class RecentsView(APIView):
    """GET /api/v1/app/transactions/recents/ list, POST { address } add-or-bump."""

    def get(self, request):
        contacts = RecentContact.objects.filter(owner=request.user).select_related('contact')[:10]
        data = []
        for c in contacts:
            wallet = c.contact.wallets.filter(currency='ZOR').first()
            data.append({'name': c.contact.full_name, 'address': wallet.address if wallet else '', 'avatar': c.contact.avatar})
        return success_response(data=data)

    def post(self, request):
        wallet = _find_zor_wallet(request.data.get('address', ''))
        if not wallet:
            return error_response('User not found', status_code=404)
        RecentContact.touch(request.user, wallet.owner)
        return success_response(message='Saved')
