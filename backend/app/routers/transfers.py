# backend/app/routers/transfers.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import db, models, schemas, auth

router = APIRouter(tags=["transfers"])

@router.get("/", response_model=list[schemas.TransferOut])
def get_transfers(db: Session = Depends(db.get_db)):
    transfers = db.query(models.Transfer).all()
    return [schemas.TransferOut(
        id=t.id,
        player_id=t.player_id,
        from_team_id=t.from_team_id,
        to_team_id=t.to_team_id,
        bought_price=t.bought_price,
        transfer_date=t.transfer_date
    ) for t in transfers]

@router.post("/")
def create_transfer(transfer: schemas.TransferCreate, db: Session = Depends(db.get_db), user: dict = Depends(auth.require_role("manager"))):
    new_transfer = models.Transfer(**transfer.dict())
    db.add(new_transfer)
    db.commit()
    return {"message": "Transfer recorded"}