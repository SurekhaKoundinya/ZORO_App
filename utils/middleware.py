from apps.system_logs.models import SystemLog

AUDIT_METHODS = ('POST', 'PUT', 'PATCH', 'DELETE')

class AuditLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.method in AUDIT_METHODS and hasattr(request, 'user') and request.user.is_authenticated:
            try:
                SystemLog.objects.create(
                    actor=request.user,
                    action=f"{request.method} {request.path}",
                    category='api',
                    severity='info',
                    ip_address=request.META.get('REMOTE_ADDR', ''),
                    status_code=response.status_code,
                )
            except Exception:
                pass
        return response
