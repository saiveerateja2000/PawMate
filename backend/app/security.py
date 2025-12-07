import os
from datetime import datetime, timedelta
from typing import Optional

from passlib.context import CryptContext
from jose import JWTError, jwt

# Prefer Argon2 when available (no 72-byte limit); fall back to bcrypt.
_prefer_argon2 = False
try:
    import argon2  # type: ignore
    _prefer_argon2 = True
except Exception:
    _prefer_argon2 = False

if _prefer_argon2:
    pwd_context = CryptContext(schemes=["argon2", "bcrypt"], default="argon2", deprecated="auto")
else:
    # keep bcrypt as fallback for environments without argon2-cffi
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Token settings
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    # If bcrypt is the active backend and the password is longer than 72 bytes,
    # bcrypt would silently truncate; prefer Argon2 when available.
    # We still allow long passwords when Argon2 is active. If bcrypt-only,
    # perform a safe-truncate to 72 bytes to avoid errors from some bcrypt backends.
    try:
        # detect whether active has 'bcrypt' as the handler in use
        if not _prefer_argon2:
            # ensure password is bytes and truncate to 72 bytes
            b = password.encode('utf-8')
            if len(b) > 72:
                b = b[:72]
                # use the truncated unicode string for hashing
                password = b.decode('utf-8', errors='ignore')
        return pwd_context.hash(password)
    except Exception:
        # Re-raise to allow upstream handling/logging
        raise


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise
