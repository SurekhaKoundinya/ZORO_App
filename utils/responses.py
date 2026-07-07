from rest_framework.response import Response
from rest_framework import status

def success_response(data=None, message="OK", status_code=status.HTTP_200_OK):
    return Response({'success': True, 'data': data, 'message': message}, status=status_code)

def error_response(message="Error", status_code=status.HTTP_400_BAD_REQUEST, errors=None):
    payload = {'success': False, 'message': message, 'statusCode': status_code}
    if errors:
        payload['errors'] = errors
    return Response(payload, status=status_code)
