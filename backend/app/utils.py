# backend/app/utils.py
import bcrypt

def get_password_hash(password: str) -> str:
    """Hash a plaintext password."""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check a plaintext password against a hash."""
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())