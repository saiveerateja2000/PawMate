from typing import Optional
from sqlalchemy.orm import Session
from . import models, schemas
from .security import get_password_hash, verify_password

def create_pet(db: Session, pet: schemas.PetCreate, image_bytes: Optional[bytes] = None, image_mime: Optional[str] = None):
    db_pet = models.Pet(name=pet.name, species=pet.species, age=pet.age, image=image_bytes, image_mime=image_mime)
    db.add(db_pet)
    db.commit()
    db.refresh(db_pet)
    return db_pet

def get_pets(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Pet).offset(skip).limit(limit).all()

def get_pet_by_id(db: Session, pet_id: int):
    return db.query(models.Pet).filter(models.Pet.id == pet_id).first()

def update_pet(db: Session, pet_id: int, pet: schemas.PetCreate, image_bytes: Optional[bytes] = None, image_mime: Optional[str] = None):
    db_pet = get_pet_by_id(db, pet_id)
    if not db_pet:
        return None
    db_pet.name = pet.name
    db_pet.species = pet.species
    db_pet.age = pet.age
    if image_bytes:
        db_pet.image = image_bytes
        db_pet.image_mime = image_mime
    db.commit()
    db.refresh(db_pet)
    return db_pet

def delete_pet(db: Session, pet_id: int):
    db_pet = get_pet_by_id(db, pet_id)
    if not db_pet:
        return False
    db.delete(db_pet)
    db.commit()
    return True


def create_appointment(db: Session, appointment: schemas.AppointmentCreate, created_by: Optional[int] = None):
    db_app = models.Appointment(
        pet_id=appointment.pet_id,
        scheduled_at=appointment.scheduled_at,
        status=appointment.status or 'scheduled',
        notes=appointment.notes,
        diagnosis=appointment.diagnosis,
        treatment=appointment.treatment,
        created_by=created_by,
    )
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app


def get_appointments(db: Session, skip: int = 0, limit: int = 100, created_by: Optional[int] = None):
    q = db.query(models.Appointment)
    if created_by is not None:
        q = q.filter(models.Appointment.created_by == created_by)
    return q.offset(skip).limit(limit).all()


def get_appointment_by_id(db: Session, appointment_id: int):
    return db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()


def update_appointment(db: Session, appointment_id: int, appointment: schemas.AppointmentCreate):
    db_app = get_appointment_by_id(db, appointment_id)
    if not db_app:
        return None
    db_app.pet_id = appointment.pet_id
    db_app.scheduled_at = appointment.scheduled_at
    db_app.status = appointment.status or db_app.status
    db_app.notes = appointment.notes
    db_app.diagnosis = appointment.diagnosis
    db_app.treatment = appointment.treatment
    db.commit()
    db.refresh(db_app)
    return db_app


def delete_appointment(db: Session, appointment_id: int):
    db_app = get_appointment_by_id(db, appointment_id)
    if not db_app:
        return False
    db.delete(db_app)
    db.commit()
    return True


# --- User CRUD / Auth helpers ---
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def get_any_user(db: Session):
    return db.query(models.User).first()


def create_user(db: Session, user: schemas.UserCreate, is_staff: bool = False):
    hashed = get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed, is_staff=is_staff)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
