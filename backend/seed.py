# backend/seed.py
from app.db import SessionLocal
from app.models import League, Season, Team, Player, TeamPlayer, User
from app.utils import get_password_hash

def seed_data():
    db = SessionLocal()
    try:
        # Leagues
        leagues_data = [
            {"name": "Premier League"},
            {"name": "Championship"},
            {"name": "Bundesliga"},
            {"name": "La Liga"}
        ]
        leagues = []
        for data in leagues_data:
            league = League(**data)
            db.add(league)
            leagues.append(league)
        db.flush()

        # Season
        season = Season(year_start=2024, year_end=2025)
        db.add(season)
        db.flush()

        # Teams
        team_counts = [20, 24, 18, 20]  # PL, CH, BL, LL
        team_id = 1
        for i, league in enumerate(leagues):
            for j in range(team_counts[i]):
                team = Team(name=f"Team {team_id}", league_id=league.id, season_id=season.id)
                db.add(team)
                # Add players
                for k in range(22):  # 22 players per team
                    position = "GK" if k == 0 else ("DEF" if k < 6 else ("MID" if k < 12 else "FWD"))
                    player = Player(name=f"Player {team_id}-{k+1}", position=position)
                    db.add(player)
                    db.flush()
                    team_player = TeamPlayer(team_id=team.id, player_id=player.id, squad_number=k+1)
                    db.add(team_player)
                team_id += 1

        # Admin user
        admin_user = User(username="admin", hashed_password=get_password_hash("admin123"), role="admin")
        db.add(admin_user)

        db.commit()
        print("Data seeded successfully")
    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()