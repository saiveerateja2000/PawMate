import os
from typing import Optional, List
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta
import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import io
import imghdr
from sqlalchemy.orm import Session
from . import models, schemas, crud
from .database import engine, Base, get_db
from .security import create_access_token

# Create DB tables if using e.g. SQLite dev. In production use Alembic migrations.
Base.metadata.create_all(bind=engine)

# Make sure optional columns added after initial schema changes exist in dev DBs.
try:
    # avoid circular import since ensure helpers are in database module
    from .database import ensure_image_mime_column, ensure_appointment_created_by_column
    ensure_image_mime_column()
    ensure_appointment_created_by_column()
except Exception:
    pass

app = FastAPI(title="PawMate API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}


# --- Authentication dependencies & helpers ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    from jose import JWTError, jwt
    from .schemas import TokenData
    from .security import SECRET_KEY, ALGORITHM
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


def get_current_active_user(current_user: "schemas.User" = Depends(get_current_user)):
    return current_user


def get_current_active_staff_user(current_user: "schemas.User" = Depends(get_current_user)):
    if not getattr(current_user, 'is_staff', False):
        raise HTTPException(status_code=403, detail="Staff privileges required")
    return current_user

@app.get("/pets", response_model=List[schemas.PetResponse])
def read_pets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Return a list of pets without binary image data."""
    pets = crud.get_pets(db, skip=skip, limit=limit)
    return pets

@app.post("/pets", response_model=schemas.PetResponse)
async def create_pet(name: str = Form(...), species: str = Form(...), age: Optional[int] = Form(None), image: Optional[UploadFile] = File(None), db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_active_staff_user)):
    image_bytes = None
    image_mime = None
    if image:
        image_bytes = await image.read()
        # prefer provided content_type
        image_mime = getattr(image, 'content_type', None)
    pet_in = schemas.PetCreate(name=name, species=species, age=age)
    return crud.create_pet(db, pet_in, image_bytes=image_bytes, image_mime=image_mime)

@app.get("/pets/{pet_id}", response_model=schemas.PetResponse)
def get_pet(pet_id: int, db: Session = Depends(get_db)):
    pet = crud.get_pet_by_id(db, pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet

@app.put("/pets/{pet_id}", response_model=schemas.PetResponse)
async def update_pet(pet_id: int, name: str = Form(...), species: str = Form(...), age: Optional[int] = Form(None), image: Optional[UploadFile] = File(None), db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_active_staff_user)):
    image_bytes = None
    image_mime = None
    if image:
        image_bytes = await image.read()
        image_mime = getattr(image, 'content_type', None)
    pet_in = schemas.PetCreate(name=name, species=species, age=age)
    updated_pet = crud.update_pet(db, pet_id, pet_in, image_bytes=image_bytes, image_mime=image_mime)
    if not updated_pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return updated_pet

@app.delete("/pets/{pet_id}")
def delete_pet(pet_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_active_staff_user)):
    if not crud.delete_pet(db, pet_id):
        raise HTTPException(status_code=404, detail="Pet not found")
    return {"detail": "Pet deleted successfully"}

@app.get("/pets/{pet_id}/image")
def get_pet_image(pet_id: int, db: Session = Depends(get_db)):
    pet = crud.get_pet_by_id(db, pet_id)
    if not pet or not pet.image:
        raise HTTPException(status_code=404, detail="Image not found")
    # Determine media type: prefer stored mime, else detect from bytes
    media_type = getattr(pet, 'image_mime', None)
    if not media_type:
        detected = imghdr.what(None, h=pet.image)
        if detected:
            # imghdr returns 'jpeg', 'png', 'gif', etc.
            media_type = f"image/{'jpeg' if detected == 'jpeg' else detected}"
        else:
            media_type = 'application/octet-stream'

    headers = { 'Content-Length': str(len(pet.image)) }
    return StreamingResponse(io.BytesIO(pet.image), media_type=media_type, headers=headers)


# Appointments endpoints
@app.post("/appointments", response_model=schemas.Appointment)
def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_active_user)):
    # store which user created this appointment
    created_by = getattr(current_user, 'id', None)
    return crud.create_appointment(db, appointment, created_by=created_by)


@app.get("/appointments", response_model=List[schemas.Appointment])
def list_appointments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    # staff users can see all appointments; regular users see only their own
    if getattr(current_user, 'is_staff', False):
        return crud.get_appointments(db, skip=skip, limit=limit)
    else:
        return crud.get_appointments(db, skip=skip, limit=limit, created_by=getattr(current_user, 'id', None))


@app.get("/appointments/{appointment_id}", response_model=schemas.Appointment)
def get_appointment(appointment_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    app_obj = crud.get_appointment_by_id(db, appointment_id)
    if not app_obj:
        raise HTTPException(status_code=404, detail="Appointment not found")
    # Non-staff may only view their own appointments
    if not getattr(current_user, 'is_staff', False) and app_obj.created_by != getattr(current_user, 'id', None):
        raise HTTPException(status_code=403, detail="Not authorized to view this appointment")
    return app_obj


@app.put("/appointments/{appointment_id}", response_model=schemas.Appointment)
def update_appointment(appointment_id: int, appointment: schemas.AppointmentCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_active_staff_user)):
    updated = crud.update_appointment(db, appointment_id, appointment)
    if not updated:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return updated


@app.delete("/appointments/{appointment_id}")
def delete_appointment(appointment_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_active_staff_user)):
    if not crud.delete_appointment(db, appointment_id):
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"detail": "Appointment deleted"}


@app.post("/auth/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = crud.get_user_by_username(db, user.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username already registered")
    # If no users exist yet, make the first registered user a staff/admin user.
    any_user = crud.get_any_user(db)
    is_staff = False if any_user else True
    new_user = crud.create_user(db, user, is_staff=is_staff)
    return new_user


@app.post("/auth/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token_expires = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")))
    access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/auth/me", response_model=schemas.User)
def get_current_user_info(current_user: schemas.User = Depends(get_current_active_user)):
    """Get current authenticated user's info."""
    return current_user
