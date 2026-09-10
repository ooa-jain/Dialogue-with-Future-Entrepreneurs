import secrets
import time

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import get_settings

_bearer = HTTPBearer(auto_error=False)


def verify_admin(username: str, password: str) -> bool:
    settings = get_settings()
    user_ok = secrets.compare_digest(username.strip(), settings.admin_username)

    if settings.admin_password_hash:
        try:
            pass_ok = bcrypt.checkpw(password.encode(), settings.admin_password_hash.encode())
        except ValueError:
            pass_ok = False
    else:
        pass_ok = secrets.compare_digest(password, settings.admin_password)

    # Always evaluate both so timing does not reveal which half failed.
    return user_ok and pass_ok


def create_token(username: str) -> tuple[str, int]:
    settings = get_settings()
    ttl = settings.jwt_expire_minutes * 60
    now = int(time.time())
    payload = {"sub": username, "iat": now, "exp": now + ttl, "scope": "admin"}
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256"), ttl


async def require_admin(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> str:
    if creds is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sign in to view the dashboard.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    settings = get_settings()
    try:
        payload = jwt.decode(creds.credentials, settings.jwt_secret, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Your session has expired. Please sign in again.")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid session. Please sign in again.")
    if payload.get("scope") != "admin":
        raise HTTPException(status_code=403, detail="Not permitted.")
    return payload.get("sub", "admin")
