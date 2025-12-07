from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_staff: bool

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class PetBase(BaseModel):
    name: str
    species: str
    age: Optional[int] = None

class PetCreate(PetBase):
    pass

class Pet(PetBase):
    id: int

    class Config:
        orm_mode = True

class PetResponse(Pet):
    """Response schema without image binary data"""
    pass


class AppointmentBase(BaseModel):
    pet_id: int
    scheduled_at: datetime
    status: Optional[str] = 'scheduled'
    notes: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class Appointment(AppointmentBase):
    id: int
    created_by: Optional[int] = None

    class Config:
        orm_mode = True
