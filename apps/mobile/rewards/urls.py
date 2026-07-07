from rest_framework.routers import DefaultRouter
from .views import AppRewardViewSet, AppRewardProgramViewSet

router = DefaultRouter()
# 'programs' MUST be registered before the '' (root) viewset — otherwise the
# root viewset's detail route ^(?P<pk>[^/.]+)/$ would match "programs/" first
# and Django would try to look up a reward with pk="programs".
router.register('programs', AppRewardProgramViewSet, basename='app-reward-programs')
router.register('', AppRewardViewSet, basename='app-rewards')

urlpatterns = router.urls
