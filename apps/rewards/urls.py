from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RewardViewSet, RewardProgramViewSet

router = DefaultRouter()
router.register(r'programs', RewardProgramViewSet, basename='reward-programs')
router.register(r'', RewardViewSet, basename='rewards')
urlpatterns = [path('', include(router.urls))]
