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