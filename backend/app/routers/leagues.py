from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import schemas, models, auth, db

router = APIRouter(tags=["leagues"])

@router.get("", response_model=list[schemas.LeagueOut])
def list_leagues(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(db.get_db)
):
    leagues = db.query(models.League).offset(skip).limit(limit).all()
    return [schemas.LeagueOut(id=l.id, name=l.name) for l in leagues]
