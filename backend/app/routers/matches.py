# backend/app/routers/matches.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import timedelta
from .. import schemas, models, auth, db

router = APIRouter(tags=["matches"])

@router.get("/", response_model=list[schemas.MatchOut])
def list_matches(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(db.get_db)
):
    matches = db.query(models.Match).offset(skip).limit(limit).all()
    return [schemas.MatchOut(id=m.id, season_id=m.season_id,
                            home_team_id=m.home_team_id,
                            away_team_id=m.away_team_id,
                            status=m.status, scheduled_at=m.scheduled_at) for m in matches]

@router.post("/", response_model=schemas.MatchOut)
def create_match(
    match_in: schemas.MatchCreate,
    db: Session = Depends(db.get_db)
):
    match = models.Match(**match_in.dict(), status="scheduled")
    db.add(match)
    db.commit()
    db.refresh(match)
    return schemas.MatchOut(id=match.id, season_id=match.season_id,
                            home_team_id=match.home_team_id,
                            away_team_id=match.away_team_id,
                            status=match.status, scheduled_at=match.scheduled_at)

@router.put("/{match_id}/scores")
def update_match_score(match_id: int, score: schemas.MatchScoreUpdate, db: Session = Depends(db.get_db), user: dict = Depends(auth.require_role("manager"))):
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    existing_score = db.query(models.MatchScore).filter(models.MatchScore.match_id == match_id).first()
    if existing_score:
        existing_score.home_goals = score.home_goals
        existing_score.away_goals = score.away_goals
    else:
        new_score = models.MatchScore(match_id=match_id, home_goals=score.home_goals, away_goals=score.away_goals)
        db.add(new_score)
    match.status = "completed"
    db.commit()
    return {"message": "Score updated"}

@router.post("/{match_id}/stats")
def add_player_stats(match_id: int, stats: list[schemas.PlayerStatCreate], db: Session = Depends(db.get_db), user: dict = Depends(auth.require_role("manager"))):
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    for stat in stats:
        player_stat = models.PlayerStat(match_id=match_id, **stat.dict())
        db.add(player_stat)
    db.commit()
    return {"message": "Stats added"}
