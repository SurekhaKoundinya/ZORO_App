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
            name='KYCRequest',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('level', models.IntegerField(default=1)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected'), ('resubmit', 'Resubmit')], default='pending', max_length=20)),
                ('notes', models.TextField(blank=True)),
                ('submitted_at', models.DateTimeField(auto_now_add=True)),
                ('reviewed_at', models.DateTimeField(blank=True, null=True)),
                ('reviewer', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='kyc_reviews', to='users.user')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='kyc_requests', to='users.user')),
            ],
            options={
                'db_table': 'kyc_requests',
                'ordering': ['-submitted_at'],
            },
        ),
        migrations.CreateModel(
            name='KYCDocument',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('doc_type', models.CharField(choices=[('passport', 'Passport'), ('national_id', 'National ID'), ('driver_license', 'Driver License'), ('utility_bill', 'Utility Bill'), ('bank_statement', 'Bank Statement'), ('selfie', 'Selfie'), ('liveness_selfie', 'Liveness Selfie'), ('other', 'Other')], max_length=30)),
                ('file_key', models.CharField(max_length=500)),
                ('liveness_passed', models.BooleanField(blank=True, null=True)),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('kyc_request', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='documents', to='kyc.kycrequest')),
            ],
            options={
                'db_table': 'kyc_documents',
                'ordering': ['uploaded_at'],
            },
        ),
    ]
