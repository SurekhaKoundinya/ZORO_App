from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import KYCViewSet, KYCDocumentViewSet

router = DefaultRouter()
# 'documents' must be registered before the empty-prefix router below,
# otherwise DefaultRouter's detail route (r'^(?P<pk>[^/.]+)/$') would try to
# treat "documents" as a KYCRequest id.
router.register(r'documents', KYCDocumentViewSet, basename='kyc-document')
router.register(r'', KYCViewSet, basename='kyc')

urlpatterns = [path('', include(router.urls))]
