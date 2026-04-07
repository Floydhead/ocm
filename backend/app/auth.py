# backend/app/auth.py
import os
from typing import Optional
from fastapi import Depends, HTTPException, Header
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from .db import SessionLocal
from .models import User

# -------------------------------------------------------------
# Configuration – set these in your .env or Docker secrets
# -------------------------------------------------------------
SECRET_KEY = os.getenv("JWT_SECRET", "change-me-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
API_KEY = os.getenv("API_KEY", "change-me-in-prod")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# -------------------------------------------------------------
# JWT helpers
# -------------------------------------------------------------
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """Return the user object."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    db = SessionLocal()
    user = db.query(User).filter(User.username == username).first()
    db.close()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def require_role(required_role: str):
    """Dependency to require a specific role or admin."""
    def role_checker(user: dict = Depends(get_current_user)):
        if user["role"] not in [required_role, "admin"]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return role_checker

# -------------------------------------------------------------
# API‑Key guard (used for internal tooling)
# -------------------------------------------------------------
def require_api_key(x_api_key: Optional[str] = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
