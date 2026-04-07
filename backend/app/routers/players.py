# backend/app/routers/players.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models, auth, db

router = APIRouter(tags=["players"])

@router.get("/", response_model=list[schemas.PlayerOut])
def list_players(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(db.get_db)
):
    players = db.query(models.Player).offset(skip).limit(limit).all()
    return [schemas.PlayerOut(id=p.id, name=p.name) for p in players]

@router.get("/{player_id}", response_model=schemas.PlayerOut)
def get_player(player_id: int, db: Session = Depends(db.get_db)):
    player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return schemas.PlayerOut(id=player.id, name=player.name)
