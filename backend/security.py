from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from backend.config import get_settings


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
password_context = CryptContext(schemes=["pbkdf2_sha256"], pbkdf2_sha256__rounds=240000)

DEMO_USERS = {
    "analyst": {
        "username": "analyst",
        "hashed_password": password_context.hash("AegisMind-Analyst-2026"),
        "role": "security_analyst",
    }
}


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_context.verify(plain_password, hashed_password)


def authenticate_user(username: str, password: str) -> Dict[str, Any]:
    user = DEMO_USERS.get(username)
    if not user or not verify_password(password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def create_access_token(subject: str, claims: Dict[str, Any] | None = None) -> str:
    settings = get_settings()
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": subject, "exp": expires, **(claims or {})}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    settings = get_settings()
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        username = payload.get("sub")
        if username is None:
            raise credentials_error
    except JWTError as exc:
        raise credentials_error from exc
    user = DEMO_USERS.get(username)
    if user is None:
        raise credentials_error
    return {"username": user["username"], "role": user["role"]}
