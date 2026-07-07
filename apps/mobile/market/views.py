"""
Live coin prices for the Market tab (MarketScreen / CoinDetailScreen). There
is no equivalent of this anywhere in the admin portal — it's pulled from
CoinGecko's free public API (no API key required) and cached for 60s so the
app doesn't hammer a third-party API on every screen open.

ZOR itself isn't a real listed coin (it's ZORO's own in-app token, see
apps/wallets/models.py), so its "price" is a static reference value rather
than a live market feed — there's no exchange for it to be priced against.
ponytail: hardcoded reference price, wire up a real price-setting mechanism
(admin-configurable, or a real DEX listing) if/when that's needed.
"""

import json
import urllib.request
import urllib.error

from django.core.cache import cache
from rest_framework.views import APIView

from utils.responses import success_response

CACHE_KEY = 'app:market:coins'
CACHE_TTL = 60  # seconds
ZOR_PRICE_USD = 4.82
ZOR_CHANGE_24H = 0.0

# CoinGecko id -> (display name, symbol, accent colour) — accents match the app's theme
COINS = {
    'bitcoin':     ('Bitcoin', 'btc', '#F7931A'),
    'ethereum':    ('Ethereum', 'eth', '#627EEA'),
    'tether':      ('Tether', 'usdt', '#26A17B'),
    'solana':      ('Solana', 'sol', '#14F195'),
    'binancecoin': ('BNB', 'bnb', '#F3BA2F'),
    'ripple':      ('XRP', 'xrp', '#25A768'),
    'cardano':     ('Cardano', 'ada', '#0033AD'),
}


def _fetch_live_prices():
    ids = ','.join(COINS.keys())
    url = f'https://api.coingecko.com/api/v3/simple/price?ids={ids}&vs_currencies=usd&include_24hr_change=true'
    try:
        with urllib.request.urlopen(url, timeout=5) as resp:
            return json.loads(resp.read())
    except (urllib.error.URLError, TimeoutError, ValueError):
        return None


def get_market_data():
    # ponytail: cache is a pure speed optimization here, not a source of
    # truth — if the cache backend itself is down, fall through to a live
    # fetch instead of 500ing the whole Market tab.
    try:
        cached = cache.get(CACHE_KEY)
    except Exception:
        cached = None
    if cached:
        return cached

    live = _fetch_live_prices()
    coins = [{
        'id': 'zor', 'name': 'ZORO Token', 'symbol': 'zor', 'image': None,
        'accent': '#FBD12D', 'price': ZOR_PRICE_USD, 'priceChangePercentage24h': ZOR_CHANGE_24H,
    }]
    for coin_id, (name, symbol, accent) in COINS.items():
        entry = (live or {}).get(coin_id, {})
        coins.append({
            'id': symbol, 'name': name, 'symbol': symbol, 'image': None, 'accent': accent,
            'price': entry.get('usd', 0),
            'priceChangePercentage24h': round(entry.get('usd_24h_change', 0) or 0, 2),
        })

    try:
        cache.set(CACHE_KEY, coins, CACHE_TTL)
    except Exception:
        pass
    return coins


class MarketOverviewView(APIView):
    """GET /api/v1/app/market/ -> { data: [...] } — matches mockApi.getMarketOverview()."""

    def get(self, request):
        return success_response(data=get_market_data())
