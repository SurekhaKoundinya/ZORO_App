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
            name='Wallet',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('address', models.CharField(max_length=200, unique=True)),
                ('network', models.CharField(choices=[('Ethereum', 'Ethereum'), ('Bitcoin', 'Bitcoin'), ('Polygon', 'Polygon'), ('BSC', 'BSC'), ('Solana', 'Solana'), ('Tron', 'Tron'), ('Avalanche', 'Avalanche')], default='Ethereum', max_length=30)),
                ('currency', models.CharField(choices=[('USDT', 'USDT'), ('USDC', 'USDC'), ('BTC', 'BTC'), ('ETH', 'ETH'), ('BNB', 'BNB'), ('SOL', 'SOL')], default='USDT', max_length=10)),
                ('balance', models.DecimalField(decimal_places=8, default=0, max_digits=30)),
                ('status', models.CharField(choices=[('active', 'Active'), ('frozen', 'Frozen'), ('closed', 'Closed')], default='active', max_length=20)),
                ('risk_level', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical')], default='low', max_length=20)),
                ('risk_score', models.IntegerField(default=0)),
                ('total_in', models.DecimalField(decimal_places=8, default=0, max_digits=30)),
                ('total_out', models.DecimalField(decimal_places=8, default=0, max_digits=30)),
                ('freeze_reason', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_activity', models.DateTimeField(auto_now=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='wallets', to='users.user')),
            ],
            options={
                'db_table': 'wallets',
                'ordering': ['-created_at'],
            },
        ),
    ]
