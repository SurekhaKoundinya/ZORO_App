import boto3
from django.conf import settings


def _s3_client():
    return boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME,
    )


def upload_kyc_file(file_obj, key):
    """Upload an in-memory uploaded file to the private KYC S3 bucket."""
    _s3_client().upload_fileobj(
        file_obj,
        settings.AWS_STORAGE_BUCKET_NAME,
        key,
        ExtraArgs={'ACL': 'private', 'ContentType': getattr(file_obj, 'content_type', 'application/octet-stream')},
    )
    return key


def get_presigned_url(file_key, expires_in=300):
    """Generate a short-lived signed URL so an admin can preview a private document."""
    return _s3_client().generate_presigned_url(
        'get_object',
        Params={'Bucket': settings.AWS_STORAGE_BUCKET_NAME, 'Key': file_key},
        ExpiresIn=expires_in,
    )
