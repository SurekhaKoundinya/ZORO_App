#!/bin/sh
set -e

# Runs at container start, when real env vars (SECRET_KEY, DB creds, etc.)
# are actually available — never at `docker build` time.
python manage.py collectstatic --noinput

exec "$@"
