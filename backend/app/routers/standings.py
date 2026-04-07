# backend/app/routers/standings.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import db, models

router = APIRouter(tags=["standings"])

@router.get("/")
def get_standings(league_id: int, season_id: int, db: Session = Depends(db.get_db)):
    # Get all teams in league and season
    teams = db.query(models.Team).filter(models.Team.league_id == league_id, models.Team.season_id == season_id).all()
    standings = []
    for team in teams:
        # Get matches for team
        home_matches = db.query(models.Match).filter(models.Match.season_id == season_id, models.Match.home_team_id == team.id).all()
        away_matches = db.query(models.Match).filter(models.Match.season_id == season_id, models.Match.away_team_id == team.id).all()
        played = 0
        won = 0
        drawn = 0
        lost = 0
        gf = 0
        ga = 0
        points = 0
        for match in home_matches + away_matches:
            if match.status != "completed":
                continue
            score = db.query(models.MatchScore).filter(models.MatchScore.match_id == match.id).first()
            if not score:
                continue
            played += 1
            if match.home_team_id == team.id:
                gf += score.home_goals
                ga += score.away_goals
                if score.home_goals > score.away_goals:
                    won += 1
                    points += 3
                elif score.home_goals == score.away_goals:
                    drawn += 1
                    points += 1
                else:
                    lost += 1
            else:
                gf += score.away_goals
                ga += score.home_goals
                if score.away_goals > score.home_goals:
                    won += 1
                    points += 3
                elif score.away_goals == score.home_goals:
                    drawn += 1
                    points += 1
                else:
                    lost += 1
        gd = gf - ga
        standings.append({
            "team_id": team.id,
            "team_name": team.name,
            "played": played,
            "won": won,
            "drawn": drawn,
            "lost": lost,
            "gf": gf,
            "ga": ga,
            "gd": gd,
            "points": points
        })
    # Sort by points desc, then gd desc, then gf desc
    standings.sort(key=lambda x: (-x["points"], -x["gd"], -x["gf"]))
    return standings