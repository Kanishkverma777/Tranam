# SafeFlow Global — Notification Service (SMS Alerts)

import logging
from ..config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


async def send_sms(to: str, message: str) -> bool:
    """Send SMS via Twilio. Falls back to logging in dev mode."""
    if not settings.TWILIO_ACCOUNT_SID or settings.ENVIRONMENT == "development":
        logger.info(f"[SMS MOCK] To: {to} | Message: {message}")
        return True

    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(
            body=message,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=to,
        )
        logger.info(f"SMS sent to {to}")
        return True
    except Exception as e:
        logger.error(f"SMS failed to {to}: {e}")
        return False


async def send_emergency_alert(worker_name: str, location: str,
                                emergency_contact: str, coordinates: dict = None):
    """Fire emergency alert when dead man's switch triggers."""
    coord_str = ""
    if coordinates:
        coord_str = f"\nGPS: {coordinates.get('lat')}, {coordinates.get('lng')}"
        coord_str += f"\nMaps: https://maps.google.com/?q={coordinates.get('lat')},{coordinates.get('lng')}"

    message = (
        f"🚨 EMERGENCY ALERT — SafeFlow\n\n"
        f"Worker {worker_name} has NOT checked out.\n"
        f"Location: {location}{coord_str}\n\n"
        f"They may be in danger. Please check on them immediately.\n"
        f"If unreachable, contact local emergency services."
    )

    return await send_sms(emergency_contact, message)


async def send_worker_ping(phone: str, worker_name: str):
    """Ping worker to check if they're okay."""
    message = (
        f"SafeFlow: Hi {worker_name}, your check-in timer is expiring. "
        f"Please check out if you're safe, or reply HELP if you need assistance."
    )
    return await send_sms(phone, message)
