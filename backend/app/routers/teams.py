# backend/app/routers/teams.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import func
from sqlalchemy.orm import Session
import io
import csv
from typing import Optional
from .. import schemas, models, auth, db

router = APIRouter(tags=["teams"])


def get_or_create_player_by_name(db: Session, player_name: str) -> models.Player:
    name = player_name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Player name cannot be empty")

    player = db.query(models.Player).filter(models.Player.name == name).first()
    if player:
        return player

    player = models.Player(name=name, position="MID")
    db.add(player)
    db.commit()
    db.refresh(player)
    return player


@router.get("/", response_model=list[schemas.TeamOut])
def list_teams(
    skip: int = 0,
    limit: int = 50,
    league_id: int = None,
    season_id: int = None,
    db: Session = Depends(db.get_db)
):
    query = db.query(models.Team)
    
    if league_id is not None:
        query = query.filter(models.Team.league_id == league_id)
    
    if season_id is not None:
        query = query.filter(models.Team.season_id == season_id)
    
    teams = query.offset(skip).limit(limit).all()
    return [schemas.TeamOut(id=t.id, name=t.name, league_id=t.league_id,
                            season_id=t.season_id) for t in teams]

@router.post("/", response_model=schemas.TeamOut)
def create_team(team_in: schemas.TeamCreate, db: Session = Depends(db.get_db)):
    team = models.Team(**team_in.dict())
    db.add(team)
    db.commit()
    db.refresh(team)
    return schemas.TeamOut(id=team.id, name=team.name, league_id=team.league_id, season_id=team.season_id)

@router.get("/{team_id}/players", response_model=list[schemas.TeamPlayerOut])
def get_team_players(team_id: int, db: Session = Depends(db.get_db)):
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    team_players = db.query(models.TeamPlayer).filter(models.TeamPlayer.team_id == team_id).order_by(models.TeamPlayer.squad_number).all()
    return [
        schemas.TeamPlayerOut(
            id=tp.id,
            squad_number=tp.squad_number,
            player=schemas.PlayerOut(
                id=tp.player.id,
                name=tp.player.name,
                position=tp.player.position,
                sofifa_id=tp.player.sofifa_id,
            ),
        )
        for tp in team_players
    ]

@router.patch("/{team_id}", response_model=schemas.TeamOut)
def update_team(team_id: int, team_update: schemas.TeamUpdate, db: Session = Depends(db.get_db), user = Depends(auth.require_role("admin"))):
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    if team_update.name is not None:
        team.name = team_update.name

    if team_update.league_id is not None:
        league = db.query(models.League).filter(models.League.id == team_update.league_id).first()
        if not league:
            raise HTTPException(status_code=404, detail="League not found")
        team.league_id = team_update.league_id

    db.add(team)
    db.commit()
    db.refresh(team)
    return schemas.TeamOut(id=team.id, name=team.name, league_id=team.league_id, season_id=team.season_id)

@router.post("/{team_id}/players", response_model=schemas.TeamPlayerOut)
def add_team_player(team_id: int, player_assign: schemas.TeamPlayerAssign, db: Session = Depends(db.get_db), user = Depends(auth.require_role("manager"))):
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    if not player_assign.player_id and not player_assign.player_name:
        raise HTTPException(status_code=400, detail="player_id or player_name is required")

    if player_assign.player_id:
        player = db.query(models.Player).filter(models.Player.id == player_assign.player_id).first()
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
    else:
        player = get_or_create_player_by_name(db, player_assign.player_name)

    existing = db.query(models.TeamPlayer).filter(models.TeamPlayer.team_id == team_id, models.TeamPlayer.player_id == player.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Player already exists in squad")

    squad_number = player_assign.squad_number
    if squad_number is None:
        squad_number = db.query(func.max(models.TeamPlayer.squad_number)).filter(models.TeamPlayer.team_id == team_id).scalar() or 0
        squad_number += 1

    team_player = models.TeamPlayer(team_id=team_id, player_id=player.id, squad_number=squad_number)
    db.add(team_player)
    db.commit()
    db.refresh(team_player)

    return schemas.TeamPlayerOut(
        id=team_player.id,
        squad_number=team_player.squad_number,
        player=schemas.PlayerOut(
            id=player.id,
            name=player.name,
            position=player.position,
            sofifa_id=player.sofifa_id,
        ),
    )

@router.patch("/{team_id}/players/order")
def update_team_player_order(team_id: int, order: list[schemas.TeamPlayerOrder], db: Session = Depends(db.get_db), user = Depends(auth.require_role("manager"))):
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    for item in order:
        team_player = db.query(models.TeamPlayer).filter(models.TeamPlayer.id == item.id, models.TeamPlayer.team_id == team_id).first()
        if not team_player:
            raise HTTPException(status_code=404, detail=f"Squad member {item.id} not found")
        team_player.squad_number = item.squad_number
        db.add(team_player)

    db.commit()
    return {"message": "Squad order updated"}

@router.patch("/{team_id}/players/{team_player_id}", response_model=schemas.TeamPlayerOut)
def update_team_player(team_id: int, team_player_id: int, player_update: schemas.TeamPlayerUpdate, db: Session = Depends(db.get_db), user = Depends(auth.require_role("manager"))):
    team_player = db.query(models.TeamPlayer).filter(models.TeamPlayer.id == team_player_id, models.TeamPlayer.team_id == team_id).first()
    if not team_player:
        raise HTTPException(status_code=404, detail="Squad member not found")

    if player_update.player_name:
        player = get_or_create_player_by_name(db, player_update.player_name)
        team_player.player_id = player.id
    elif player_update.player_id:
        player = db.query(models.Player).filter(models.Player.id == player_update.player_id).first()
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
        team_player.player_id = player.id

    if player_update.squad_number is not None:
        team_player.squad_number = player_update.squad_number

    db.add(team_player)
    db.commit()
    db.refresh(team_player)
    player = db.query(models.Player).filter(models.Player.id == team_player.player_id).first()
    return schemas.TeamPlayerOut(
        id=team_player.id,
        squad_number=team_player.squad_number,
        player=schemas.PlayerOut(
            id=player.id,
            name=player.name,
            position=player.position,
            sofifa_id=player.sofifa_id,
        ),
    )

@router.delete("/{team_id}/players/{team_player_id}")
def delete_team_player(team_id: int, team_player_id: int, db: Session = Depends(db.get_db), user = Depends(auth.require_role("manager"))):
    team_player = db.query(models.TeamPlayer).filter(models.TeamPlayer.id == team_player_id, models.TeamPlayer.team_id == team_id).first()
    if not team_player:
        raise HTTPException(status_code=404, detail="Squad member not found")
    db.delete(team_player)
    db.commit()
    return {"message": "Player removed from squad"}

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
            max_num = db.query(func.max(models.TeamPlayer.squad_number)).filter(models.TeamPlayer.team_id == team_id).scalar() or 0
            team_player = models.TeamPlayer(team_id=team_id, player_id=player.id, squad_number=max_num + 1)
            db.add(team_player)
    db.commit()
    return {"message": "Players uploaded"}