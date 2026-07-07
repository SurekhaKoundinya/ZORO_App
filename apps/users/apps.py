from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'

    def ready(self):
        from django.db.models.signals import post_migrate
        post_migrate.connect(self._create_default_superadmin, sender=self)

    @staticmethod
    def _create_default_superadmin(sender, **kwargs):
        from django.core.management import call_command
        try:
            call_command('create_superadmin')
        except Exception:
            # Never let a bad/missing .env value break `migrate` itself.
            pass
