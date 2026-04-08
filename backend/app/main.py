# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import db, auth, schemas, models
from .routers import leagues, players, teams, seasons, users, matches, standings, transfers
from .routers.login import router as login_router  # new

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
db.Base.metadata.create_all(bind=db.engine)

# Seed data on startup if database is empty
def initialize_seed_data():
    """Initialize database with seed data if it's empty."""
    db_session = db.SessionLocal()
    try:
        # Check if data already exists
        league_count = db_session.query(models.League).count()
        if league_count == 0:
            # Seed leagues
            leagues_data = [
                {"name": "Premier League"},
                {"name": "Championship"},
                {"name": "Bundesliga"},
                {"name": "La Liga"}
            ]
            leagues = []
            for data in leagues_data:
                league = models.League(**data)
                db_session.add(league)
                leagues.append(league)
            db_session.flush()

            # Seed season
            season = models.Season(year_start=2024, year_end=2025)
            db_session.add(season)
            db_session.flush()

            # Seed teams and players
            from .utils import get_password_hash
            team_counts = [20, 24, 18, 20]  # PL, CH, BL, LL
            team_id = 1
            for i, league in enumerate(leagues):
                for j in range(team_counts[i]):
                    team = models.Team(name=f"Team {team_id}", league_id=league.id, season_id=season.id)
                    db_session.add(team)
                    # Add players
                    for k in range(22):  # 22 players per team
                        position = "GK" if k == 0 else ("DEF" if k < 6 else ("MID" if k < 12 else "FWD"))
                        player = models.Player(name=f"Player {team_id}-{k+1}", position=position)
                        db_session.add(player)
                        db_session.flush()
                        team_player = models.TeamPlayer(team_id=team.id, player_id=player.id, squad_number=k+1)
                        db_session.add(team_player)
                    team_id += 1

            # Seed admin user
            from .utils import get_password_hash
            admin_user = models.User(username="admin", hashed_password=get_password_hash("admin123"), role="admin")
            db_session.add(admin_user)

            db_session.commit()
            print("✓ Database seeded with initial data")
    except Exception as e:
        db_session.rollback()
        print(f"✗ Error initializing seed data: {e}")
    finally:
        db_session.close()

initialize_seed_data()

# Include routers
app.include_router(login_router, prefix="", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(leagues.router, prefix="/leagues", tags=["leagues"])
app.include_router(seasons.router, prefix="/seasons", tags=["seasons"])
app.include_router(teams.router, prefix="/teams", tags=["teams"])
app.include_router(players.router, prefix="/players", tags=["players"])
app.include_router(matches.router, prefix="/matches", tags=["matches"])
app.include_router(standings.router, prefix="/standings", tags=["standings"])
app.include_router(transfers.router, prefix="/transfers", tags=["transfers"])

@app.get("/", tags=["root"])
def read_root():
    return {"message": "Welcome to OCM API"}

@app.get("/health", tags=["root"])
def health():
    return {"status": "ok"}