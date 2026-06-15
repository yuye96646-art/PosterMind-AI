import logging
import os
import uuid

from app.config import settings

logger = logging.getLogger(__name__)

MEDIA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "media")
os.makedirs(MEDIA_DIR, exist_ok=True)


def upload_poster(image_bytes: bytes, filename: str) -> str:
    """
    Step 6 of the workflow: Upload poster image to storage.
    Uses Cloudflare R2 / AWS S3 via boto3 when configured.
    Falls back to local file storage.
    """
    backend = settings.STORAGE_BACKEND

    if backend in ("r2", "s3") and settings.R2_ACCESS_KEY_ID:
        return _upload_to_r2(image_bytes, filename)
    else:
        return _save_local(image_bytes, filename)


def _upload_to_r2(image_bytes: bytes, filename: str) -> str:
    import boto3

    s3 = boto3.client(
        "s3",
        endpoint_url=settings.R2_ENDPOINT_URL,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
    )

    s3.put_object(
        Bucket=settings.R2_BUCKET,
        Key=filename,
        Body=image_bytes,
        ContentType="image/png",
    )

    url = f"{settings.R2_PUBLIC_URL}/{filename}"
    logger.info(f"Uploaded poster to R2: {url}")
    return url


def _save_local(image_bytes: bytes, filename: str) -> str:
    filepath = os.path.join(MEDIA_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(image_bytes)
    url = f"http://localhost:8000/media/{filename}"
    logger.info(f"Saved poster locally: {url}")
    return url
