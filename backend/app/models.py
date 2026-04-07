# backend/app/models.py
from .db import Base
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    hashed_password = Column(String(128), nullable=False)
    role = Column(String(20), nullable=False)  # admin, manager, spectator

class League(Base):
    __tablename__ = "leagues"
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)

class Season(Base):
    __tablename__ = "seasons"
    id = Column(Integer, primary_key=True)
    year_start = Column(Integer, nullable=False)
    year_end = Column(Integer, nullable=False)

class Team(Base):
    __tablename__ = "teams"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    league_id = Column(Integer, ForeignKey("leagues.id"), nullable=False)
    season_id = Column(Integer, ForeignKey("seasons.id"), nullable=False)
    squad = relationship("TeamPlayer", back_populates="team")

class Player(Base):
    __tablename__ = "players"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    position = Column(String(10), nullable=False)  # GK, DEF, MID, FWD
    sofifa_id = Column(Integer, unique=True, nullable=True)

class TeamPlayer(Base):
    __tablename__ = "team_players"
    id = Column(Integer, primary_key=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    squad_number = Column(Integer, nullable=False)
    __table_args__ = (
        UniqueConstraint("team_id", "squad_number", name="uq_team_squad_number"),
    )
    team = relationship("Team", back_populates="squad")
    player = relationship("Player")

class Match(Base):
    __tablename__ = "matches"
    id = Column(Integer, primary_key=True)
    season_id = Column(Integer, ForeignKey("seasons.id"), nullable=False)
    home_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    away_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    status = Column(String(20), default="scheduled")  # scheduled, completed
    scheduled_at = Column(DateTime, nullable=True)

class MatchScore(Base):
    __tablename__ = "match_scores"
    id = Column(Integer, primary_key=True)
    match_id = Column(Integer, ForeignKey("matches.id"), unique=True, nullable=False)
    home_goals = Column(Integer, default=0)
    away_goals = Column(Integer, default=0)

class PlayerStat(Base):
    __tablename__ = "player_stats"
    id = Column(Integer, primary_key=True)
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    goals = Column(Integer, default=0)
    assists = Column(Integer, default=0)
    yellow_cards = Column(Integer, default=0)
    red_cards = Column(Integer, default=0)
    minutes_played = Column(Integer, default=0)

class Transfer(Base):
    __tablename__ = "transfers"
    id = Column(Integer, primary_key=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    from_team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)  # null if free agent
    to_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    bought_price = Column(Integer, nullable=True)  # in millions
    transfer_date = Column(DateTime, default=datetime.utcnow)
