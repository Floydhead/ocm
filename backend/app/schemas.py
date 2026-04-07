# backend/app/schemas.py
from pydantic import BaseModel, PositiveInt
from typing import List, Optional
from datetime import datetime

# -----------------------------------------------------------------
# User
# -----------------------------------------------------------------
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    role: str

class UserLogin(UserBase):
    password: str

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class UserOut(UserBase):
    id: int
    role: str

# -----------------------------------------------------------------
# League
# -----------------------------------------------------------------
class LeagueBase(BaseModel):
    name: str

class LeagueOut(LeagueBase):
    id: int

# -----------------------------------------------------------------
# Season
# -----------------------------------------------------------------
class SeasonBase(BaseModel):
    year_start: int
    year_end: int

class SeasonOut(SeasonBase):
    id: int

# -----------------------------------------------------------------
# Team
# -----------------------------------------------------------------
class TeamBase(BaseModel):
    name: str
    league_id: int
    season_id: int

class TeamCreate(TeamBase):
    pass

class TeamOut(TeamBase):
    id: int

# -----------------------------------------------------------------
# Player
# -----------------------------------------------------------------
class PlayerBase(BaseModel):
    name: str
    position: str
    sofifa_id: Optional[int] = None

class PlayerCreate(PlayerBase):
    pass

class PlayerOut(PlayerBase):
    id: int

# -----------------------------------------------------------------
# TeamPlayer
# -----------------------------------------------------------------
class TeamPlayerBase(BaseModel):
    squad_number: PositiveInt

class TeamPlayerCreate(TeamPlayerBase):
    player_id: int

class TeamPlayerOut(TeamPlayerBase):
    id: int
    player: PlayerOut

# -----------------------------------------------------------------
# Match
# -----------------------------------------------------------------
class MatchBase(BaseModel):
    season_id: int
    home_team_id: int
    away_team_id: int
    scheduled_at: Optional[datetime] = None

class MatchCreate(MatchBase):
    pass

class MatchOut(MatchBase):
    id: int
    status: str

# -----------------------------------------------------------------
# MatchScore
# -----------------------------------------------------------------
class MatchScoreBase(BaseModel):
    home_goals: PositiveInt
    away_goals: PositiveInt

class MatchScoreCreate(MatchScoreBase):
    pass

class MatchScoreOut(MatchScoreBase):
    id: int
    match_id: int

class MatchScoreUpdate(BaseModel):
    home_goals: int
    away_goals: int

# -----------------------------------------------------------------
# PlayerStat
# -----------------------------------------------------------------
class PlayerStatBase(BaseModel):
    player_id: int
    goals: int = 0
    assists: int = 0
    yellow_cards: int = 0
    red_cards: int = 0
    minutes_played: int = 0

class PlayerStatCreate(PlayerStatBase):
    pass

# -----------------------------------------------------------------
# Transfer
# -----------------------------------------------------------------
class TransferBase(BaseModel):
    player_id: int
    from_team_id: Optional[int] = None
    to_team_id: int
    bought_price: Optional[int] = None

class TransferCreate(TransferBase):
    pass

class TransferOut(TransferBase):
    id: int
    transfer_date: datetime