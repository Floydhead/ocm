# backend/app/routers/teams.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import io
import csv
from .. import schemas, models, auth, db

router = APIRouter(tags=["teams"])

@router.get("/", response_model=list[schemas.TeamOut])
def list_teams(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(db.get_db)
):
    teams = db.query(models.Team).offset(skip).limit(limit).all()
    return [schemas.TeamOut(id=t.id, name=t.name, league_id=t.league_id,
                            season_id=t.season_id) for t in teams]

@router.post("/", response_model=schemas.TeamOut)
def create_team(team_in: schemas.TeamCreate, db: Session = Depends(db.get_db)):
    team = models.Team(**team_in.dict())
    db.add(team)
    db.commit()
    db.refresh(team)
    return schemas.TeamOut(id=team.id, name=team.name, league_id=team.league_id, season_id=team.season_id)

@router.get("/{team_id}/players", response_model=list[schemas.PlayerOut])
def get_team_players(team_id: int, db: Session = Depends(db.get_db)):
    team_players = db.query(models.TeamPlayer).filter(models.TeamPlayer.team_id == team_id).all()
    players = []
    for tp in team_players:
        player = db.query(models.Player).filter(models.Player.id == tp.player_id).first()
        if player:
            players.append(schemas.PlayerOut(id=player.id, name=player.name, position=player.position, sofifa_id=player.sofifa_id))
    return players

@router.post("/{team_id}/players/upload")
def upload_players(team_id: int, file: UploadFile = File(...), db: Session = Depends(db.get_db), user: dict = Depends(auth.require_role("manager"))):
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    content = file.file.read().decode('utf-8')
    reader = csv.DictReader(io.StringIO(content))
    for row in reader:
        name = row['name']
        position = row['position']
        sofifa_id = row.get('sofifa_id')
        player = db.query(models.Player).filter(models.Player.name == name).first()
        if not player:
            player = models.Player(name=name, position=position, sofifa_id=sofifa_id)
            db.add(player)
            db.flush()
        existing = db.query(models.TeamPlayer).filter(models.TeamPlayer.team_id == team_id, models.TeamPlayer.player_id == player.id).first()
        if not existing:
            max_num = db.query(db.func.max(models.TeamPlayer.squad_number)).filter(models.TeamPlayer.team_id == team_id).scalar() or 0
            team_player = models.TeamPlayer(team_id=team_id, player_id=player.id, squad_number=max_num + 1)
            db.add(team_player)
    db.commit()
    return {"message": "Players uploaded"}