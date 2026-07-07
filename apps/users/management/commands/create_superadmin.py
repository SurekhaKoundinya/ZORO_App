from django.core.management.base import BaseCommand
from django.conf import settings
from apps.users.models import User


class Command(BaseCommand):
    """
    Idempotently creates (or upgrades) the default super admin from .env values.
    Safe to run repeatedly — never duplicates, never overwrites a password
    unless --reset-password is passed.

    Usage:
        python manage.py create_superadmin
        python manage.py create_superadmin --reset-password

    This also runs automatically after every `python manage.py migrate`
    (wired via a post_migrate signal in apps/users/apps.py), so a super
    admin always exists out of the box with zero manual steps.
    """
    help = "Create the default super admin defined by SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD in .env"

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset-password',
            action='store_true',
            help="If the super admin already exists, reset their password to the .env value.",
        )

    def handle(self, *args, **options):
        email = getattr(settings, 'SUPERADMIN_EMAIL', None)
        password = getattr(settings, 'SUPERADMIN_PASSWORD', None)

        if not email or not password:
            self.stderr.write(self.style.WARNING(
                "SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD not set in .env — skipping super admin creation."
            ))
            return

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': 'Super',
                'last_name': 'Admin',
                'role': 'super_admin',
                'status': 'active',
                'is_staff': True,
                'is_superuser': True,
            },
        )

        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Super admin created: {email}"))
        else:
            changed = False
            if user.role != 'super_admin' or not user.is_staff or not user.is_superuser:
                user.role = 'super_admin'
                user.is_staff = True
                user.is_superuser = True
                changed = True
            if options['reset_password']:
                user.set_password(password)
                changed = True
            if changed:
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Super admin updated: {email}"))
            else:
                self.stdout.write(self.style.WARNING(f"Super admin already exists, no changes: {email}"))
