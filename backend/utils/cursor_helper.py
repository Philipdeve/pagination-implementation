import base64
import json


def encode_cursor(payment_id: int) -> str:
    payload = {"payment_id": payment_id}

    json_str = json.dumps(payload)

    encoded = base64.urlsafe_b64encode(
        json_str.encode()
    ).decode()

    return encoded


def decode_cursor(cursor: str) -> int:
    # Ensure valid base64 length even if client trims "=" padding.
    padded_cursor = cursor + "=" * (-len(cursor) % 4)

    try:
        decoded = base64.urlsafe_b64decode(
            padded_cursor.encode()
        ).decode()
        payload = json.loads(decoded)
        payment_id = payload["payment_id"]
    except (ValueError, KeyError, json.JSONDecodeError) as exc:
        raise ValueError("Invalid cursor") from exc

    if not isinstance(payment_id, int):
        raise ValueError("Invalid cursor")

    return payment_id