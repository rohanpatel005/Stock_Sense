"""
Google OAuth token verification utility for StockSense.

Uses google-auth library to verify Google ID tokens received from
the frontend Google Identity Services (GSI) flow.
"""

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings


def verify_google_token(credential):
    """
    Verify a Google ID token and return the decoded payload.

    Args:
        credential: The Google ID token string from the frontend.

    Returns:
        dict: Decoded token payload containing 'email', 'name', 'sub', etc.

    Raises:
        ValueError: If the token is invalid, expired, or not issued for our client.
    """
    try:
        payload = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )

        # Verify that the token was issued by Google
        if payload.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
            raise ValueError("Invalid token issuer.")

        return payload

    except Exception as e:
        raise ValueError(f"Invalid Google token: {str(e)}")
