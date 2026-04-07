# backend/app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models, auth, utils, db

router = APIRouter(tags=["users"])

@router.post("/", response_model=schemas.UserOut)
def create_user(
    user_in: schemas.UserCreate,
    db: Session = Depends(db.get_db)
):
    hashed_pw = utils.get_password_hash(user_in.password)
    user = models.User(
        username=user_in.username,
        hashed_password=hashed_pw,
        role=user_in.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return schemas.UserOut(id=user.id, username=user.username, role=user.role)

@router.get("/me", response_model=schemas.UserOut)
def get_current_user_endpoint(current_user: models.User = Depends(auth.get_current_user)):
    return schemas.UserOut(id=current_user.id, username=current_user.username, role=current_user.role)

@router.post("/change-password")
def change_password(
    request: schemas.PasswordChange,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(db.get_db)
):
    if not utils.verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = utils.get_password_hash(request.new_password)
    db.add(current_user)
    db.commit()
    return {"message": "Password updated successfully"}
