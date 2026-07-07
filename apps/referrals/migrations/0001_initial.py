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
            name='Referral',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('tier', models.CharField(choices=[('diamond', 'Diamond'), ('platinum', 'Platinum'), ('gold', 'Gold'), ('silver', 'Silver'), ('bronze', 'Bronze')], default='bronze', max_length=20)),
                ('commission', models.DecimalField(decimal_places=8, default=0, max_digits=18)),
                ('paid_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('referee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='referral_records', to='users.user')),
                ('referrer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='referrals_made', to='users.user')),
            ],
            options={
                'db_table': 'referrals',
                'ordering': ['-created_at'],
                'unique_together': {('referrer', 'referee')},
            },
        ),
    ]
