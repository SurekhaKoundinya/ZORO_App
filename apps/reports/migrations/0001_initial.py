import uuid
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Report',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
                ('report_type', models.CharField(choices=[('revenue', 'Revenue'), ('users', 'Users'), ('transactions', 'Transactions'), ('kyc', 'KYC'), ('wallets', 'Wallets'), ('referrals', 'Referrals'), ('custom', 'Custom')], max_length=30)),
                ('format', models.CharField(choices=[('csv', 'CSV'), ('xlsx', 'Excel'), ('pdf', 'PDF')], default='csv', max_length=10)),
                ('status', models.CharField(choices=[('queued', 'Queued'), ('generating', 'Generating'), ('ready', 'Ready'), ('failed', 'Failed')], default='queued', max_length=20)),
                ('period', models.CharField(blank=True, max_length=50)),
                ('file_url', models.URLField(blank=True)),
                ('file_size', models.CharField(blank=True, max_length=20)),
                ('row_count', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('generated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='reports', to='users.user')),
            ],
            options={
                'db_table': 'reports',
                'ordering': ['-created_at'],
            },
        ),
    ]
