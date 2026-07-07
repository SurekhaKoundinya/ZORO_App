"""
ZORO Backend — Base Settings
Django 5.0 + PostgreSQL + Redis + JWT
"""

import os
from pathlib import Path
from datetime import timedelta
import environ

BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

SECRET_KEY = env('SECRET_KEY')
DEBUG = env.bool('DEBUG', default=False)
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['*'])

# ── Apps ──────────────────────────────────────
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    'storages',
    'django_celery_beat',
    'django_celery_results',
    'simple_history',
]

LOCAL_APPS = [
    # ── Admin portal apps (unchanged) ─────────
    'apps.authentication',
    'apps.users',
    'apps.kyc',
    'apps.wallets',
    'apps.transactions',
    'apps.referrals',
    'apps.rewards',
    'apps.reports',
    'apps.system_logs',
    'apps.notifications',
    'apps.dashboard',
    'apps.settings_api',

    # ── Mobile app API (new) ──────────────────
    # No models/migrations of its own — reuses the models above so admin
    # portal and mobile app always read/write the exact same data.
    'apps.mobile',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# ── Middleware ────────────────────────────────
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'simple_history.middleware.HistoryRequestMiddleware',
    'utils.middleware.AuditLogMiddleware',
]

ROOT_URLCONF = 'zoro_backend.urls'
WSGI_APPLICATION = 'zoro_backend.wsgi.application'
ASGI_APPLICATION = 'zoro_backend.asgi.application'

# ── Database ──────────────────────────────────
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME'),
        'USER': env('DB_USER'),
        'PASSWORD': env('DB_PASSWORD'),
        'HOST': env('DB_HOST', default='localhost'),
        'PORT': env('DB_PORT', default='5432'),
        'OPTIONS': {'sslmode': env('DB_SSL_MODE', default='disable')},
    }
}

# ── Custom User Model ─────────────────────────
AUTH_USER_MODEL = 'users.User'

# ── Password Validators ───────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ── DRF ───────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'utils.pagination.StandardResultsPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'EXCEPTION_HANDLER': 'utils.exceptions.custom_exception_handler',
}

# ── JWT ───────────────────────────────────────
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': env('JWT_SECRET'),
    'AUTH_HEADER_TYPES': ('Bearer',),
    'TOKEN_OBTAIN_SERIALIZER': 'apps.authentication.serializers.CustomTokenObtainPairSerializer',
}

# ── Redis / Cache ─────────────────────────────
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': env('REDIS_URL', default='redis://localhost:6379/0'),
        'OPTIONS': {'CLIENT_CLASS': 'django_redis.client.DefaultClient'},
    }
}

# ── Celery ────────────────────────────────────
CELERY_BROKER_URL = env('REDIS_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = 'django-db'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_TIMEZONE = 'Asia/Kolkata'

# ── AWS S3 ────────────────────────────────────
AWS_ACCESS_KEY_ID       = env('AWS_ACCESS_KEY_ID', default='')
AWS_SECRET_ACCESS_KEY   = env('AWS_SECRET_ACCESS_KEY', default='')
AWS_STORAGE_BUCKET_NAME = env('AWS_S3_BUCKET', default='zoro-kyc-docs')
AWS_S3_REGION_NAME      = env('AWS_REGION', default='ap-south-1')
AWS_DEFAULT_ACL         = 'private'
AWS_S3_FILE_OVERWRITE   = False

# ── Email ─────────────────────────────────────
EMAIL_BACKEND       = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST          = 'smtp.sendgrid.net'
EMAIL_PORT          = 587
EMAIL_USE_TLS       = True
EMAIL_HOST_USER     = 'apikey'
EMAIL_HOST_PASSWORD = env('SENDGRID_API_KEY', default='')
DEFAULT_FROM_EMAIL  = env('MAIL_FROM', default='noreply@zoro.finance')

# ── CORS ──────────────────────────────────────
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=['http://localhost:3000'])
CORS_ALLOW_CREDENTIALS = True

from corsheaders.defaults import default_headers
CORS_ALLOW_HEADERS = list(default_headers) + ['ngrok-skip-browser-warning']

# ── Swagger ───────────────────────────────────
SPECTACULAR_SETTINGS = {
    'TITLE': 'ZORO API',
    'DESCRIPTION': 'Crypto + Finance Admin Platform — API Documentation',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'TAGS': [
        {'name': 'Auth',         'description': 'Authentication & 2FA'},
        {'name': 'Users',        'description': 'User management'},
        {'name': 'KYC',          'description': 'KYC verification'},
        {'name': 'Wallets',      'description': 'Crypto wallets'},
        {'name': 'Transactions', 'description': 'Transaction history'},
        {'name': 'Referrals',    'description': 'Referral program'},
        {'name': 'Rewards',      'description': 'Reward distributions'},
        {'name': 'Reports',      'description': 'Export & reports'},
        {'name': 'System Logs',  'description': 'Audit logs'},
        {'name': 'Notifications','description': 'In-app notifications'},
        {'name': 'Dashboard',    'description': 'Aggregate stats & charts'},
        {'name': 'Settings',     'description': 'Platform & account settings'},
        # ── Mobile app tags (new) ──────────────
        {'name': 'App Auth',          'description': 'Mobile app OTP/email login, signup, PIN, password reset'},
        {'name': 'App Wallets',       'description': 'My ZOR wallet — balance, dashboard, deposit address'},
        {'name': 'App Transactions',  'description': 'My history + P2P transfer by wallet address'},
        {'name': 'App Rewards',       'description': 'My rewards, active programs, self-service claim'},
        {'name': 'App Referrals',     'description': 'My referral code, referred users, totals'},
        {'name': 'App Market',        'description': 'Live coin prices for the Market tab'},
        {'name': 'App Bank Accounts', 'description': 'Linked bank accounts'},
        {'name': 'App Dashboard',     'description': 'Mobile app home-screen summary'},
    ],
}

# ── Static / Media ────────────────────────────
STATIC_URL  = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL   = '/media/'
MEDIA_ROOT  = BASE_DIR / 'media'

LANGUAGE_CODE = 'en-us'
TIME_ZONE     = 'Asia/Kolkata'
USE_I18N      = True
USE_TZ        = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ── 2FA ───────────────────────────────────────
TOTP_APP_NAME = env('TOTP_APP_NAME', default='ZORO Admin')

# ── Default Super Admin (auto-created after every migrate) ───
SUPERADMIN_EMAIL = env('SUPERADMIN_EMAIL', default='')
SUPERADMIN_PASSWORD = env('SUPERADMIN_PASSWORD', default='')
