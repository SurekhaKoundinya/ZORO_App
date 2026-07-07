from rest_framework import generics
from apps.mobile.models import BankAccount
from .serializers import BankAccountSerializer


class BankAccountListCreateView(generics.ListCreateAPIView):
    """
    /api/v1/app/bank-accounts/  GET (my linked accounts)  POST (link a new one)
    Matches mockApi's getBankAccounts()/addBankAccount() exactly. No bank
    TPIN here — mockApi.setBankTpin() exists but no screen in the app ever
    calls it (grepped the whole src/ tree), so it's YAGNI for now; add a
    BankAccount.tpin_hash field the same way AppProfile.pin_hash works if a
    screen starts calling it.
    """
    serializer_class = BankAccountSerializer

    def get_queryset(self):
        return BankAccount.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
