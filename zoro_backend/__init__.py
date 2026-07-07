try:
    from .celery import app as celery_app
    __all__ = ('celery_app',)
except Exception as e:
    # ponytail: don't let a broken/slow Celery+Kombu environment block
    # `runserver` — Celery is only needed for background tasks, not for
    # serving API requests. Fix your Celery install when you actually need
    # scheduled/background jobs; until then, this just gets logged.
    import warnings
    warnings.warn(f"Celery app not loaded (background tasks disabled): {e}")
    __all__ = ()
