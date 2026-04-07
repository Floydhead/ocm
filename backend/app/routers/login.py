# backend/app/routers/login.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import timedelta
from .. import auth, schemas, models, utils, db

router = APIRouter()

@router.post("/login")
def login(
    credentials: schemas.UserLogin,
    db: Session = Depends(db.get_db)
):
    user = db.query(models.User).filter(models.User.username == credentials.username).first()
    if not user or not utils.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Wrong username or password")

    access_token = auth.create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}