import uuid
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='SystemLog',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('log_id', models.CharField(blank=True, max_length=20, unique=True)),
                ('actor_label', models.CharField(default='system', max_length=100)),
                ('action', models.TextField()),
                ('category', models.CharField(choices=[('AUTH', 'Auth'), ('KYC', 'KYC'), ('TRANSACTION', 'Transaction'), ('WALLET', 'Wallet'), ('SYSTEM', 'System'), ('API', 'API'), ('SECURITY', 'Security'), ('REPORT', 'Report'), ('FRAUD', 'Fraud'), ('ADMIN', 'Admin')], default='SYSTEM', max_length=20)),
                ('severity', models.CharField(choices=[('info', 'Info'), ('warning', 'Warning'), ('danger', 'Danger'), ('success', 'Success')], default='info', max_length=20)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('status_code', models.IntegerField(blank=True, null=True)),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('actor', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='system_logs', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'system_logs',
                'ordering': ['-created_at'],
            },
        ),
    ]
