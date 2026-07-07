import uuid
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0001_initial'),
        ('wallets', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('tx_id', models.CharField(max_length=30, unique=True)),
                ('tx_type', models.CharField(choices=[('Deposit', 'Deposit'), ('Withdrawal', 'Withdrawal'), ('Transfer', 'Transfer'), ('Swap', 'Swap')], max_length=20)),
                ('amount', models.DecimalField(decimal_places=8, max_digits=30)),
                ('currency', models.CharField(max_length=10)),
                ('status', models.CharField(choices=[('completed', 'Completed'), ('pending', 'Pending'), ('failed', 'Failed'), ('processing', 'Processing')], default='pending', max_length=20)),
                ('tx_hash', models.CharField(blank=True, max_length=200)),
                ('network', models.CharField(choices=[('Ethereum', 'Ethereum'), ('Bitcoin', 'Bitcoin'), ('Polygon', 'Polygon'), ('BSC', 'BSC'), ('Solana', 'Solana'), ('Tron', 'Tron')], default='Ethereum', max_length=30)),
                ('fee', models.DecimalField(decimal_places=8, default=0, max_digits=18)),
                ('notes', models.TextField(blank=True)),
                ('flagged', models.BooleanField(default=False)),
                ('flag_reason', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transactions', to='users.user')),
                ('wallet', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='transactions', to='wallets.wallet')),
            ],
            options={
                'db_table': 'transactions',
                'ordering': ['-created_at'],
            },
        ),
    ]
