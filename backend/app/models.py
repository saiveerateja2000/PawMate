from sqlalchemy import Column, Integer, String, LargeBinary, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class Pet(Base):
    __tablename__ = 'pets'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    species = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    image = Column(LargeBinary, nullable=True)  # stores BYTEA
    image_mime = Column(String, nullable=True)  # store mime type like 'image/jpeg'


class Appointment(Base):
    __tablename__ = 'appointments'

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey('pets.id'), nullable=False)
    scheduled_at = Column(DateTime, nullable=False)
    status = Column(String, nullable=False, default='scheduled')
    notes = Column(Text, nullable=True)
    diagnosis = Column(Text, nullable=True)
    treatment = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=True)

    pet = relationship('Pet', backref='appointments')

    # relationship to user who created the appointment (optional)
    # define lazily to avoid circular import issues


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_staff = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
