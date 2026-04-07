# backend/app/routers/seasons.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import schemas, models, auth, db

router = APIRouter(tags=["seasons"])

@router.get("", response_model=list[schemas.SeasonOut])
def list_seasons(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(db.get_db)
):
    seasons = db.query(models.Season).offset(skip).limit(limit).all()
    return [schemas.SeasonOut(id=s.id, year_start=s.year_start, year_end=s.year_end) for s in seasons]
