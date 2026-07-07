from django.urls import path
from .views import BankAccountListCreateView

urlpatterns = [
    path('', BankAccountListCreateView.as_view(), name='app-bank-accounts'),
]
