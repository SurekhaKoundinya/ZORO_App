from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SystemLogViewSet
router = DefaultRouter()
router.register(r'', SystemLogViewSet, basename='system-logs')
urlpatterns = [path('', include(router.urls))]
