from .base import *
from datetime import timedelta

DEBUG = True
ALLOWED_HOSTS = ['*']

# Allow any frontend origin in development (ngrok, localhost, etc.)
CORS_ALLOW_ALL_ORIGINS = True

# Extend JWT access token lifetime (default 15 min is too short for dev)
SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'] = timedelta(hours=8)

# Show emails in console during dev
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

INSTALLED_APPS += ['debug_toolbar']
MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
INTERNAL_IPS = ['127.0.0.1']
