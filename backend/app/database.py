from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import text
import os

# PostgreSQL as primary database, with SQLite fallback for development
# Default: PostgreSQL at localhost:5432
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://pawmate:pawmate@localhost:5432/pawmate_db"
)

# If PostgreSQL is not available and env var not set, use SQLite fallback
try:
    engine = create_engine(DATABASE_URL, future=True, pool_pre_ping=True)
    # Test connection
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
except Exception as e:
    print(f"PostgreSQL connection failed: {e}. Falling back to SQLite...")
    DATABASE_URL = "sqlite:///./pawmate.db"
    engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def ensure_image_mime_column():
    """Ensure the `image_mime` column exists on the `pets` table.

    This is a small, idempotent dev helper to avoid manual migrations when
    the app adds a new optional column. For production use, prefer Alembic.
    """
    try:
        with engine.begin() as conn:
            dialect = engine.dialect.name
            if dialect == 'sqlite':
                # Check pragma for column existence
                res = conn.execute(text("PRAGMA table_info('pets')")).fetchall()
                cols = [row[1] for row in res]
                if 'image_mime' not in cols:
                    conn.execute(text("ALTER TABLE pets ADD COLUMN image_mime VARCHAR;"))
            else:
                # For Postgres and others, use IF NOT EXISTS when supported
                conn.execute(text("ALTER TABLE pets ADD COLUMN IF NOT EXISTS image_mime VARCHAR;"))
    except Exception:
        # Be conservative: if anything goes wrong, don't crash the app here.
        # The application will still run; schema migration can be applied manually.
        pass

def ensure_appointment_created_by_column():
    """Ensure `created_by` exists on `appointments` table (dev helper)."""
    try:
        with engine.begin() as conn:
            dialect = engine.dialect.name
            if dialect == 'sqlite':
                res = conn.execute(text("PRAGMA table_info('appointments')")).fetchall()
                cols = [row[1] for row in res]
                if 'created_by' not in cols:
                    conn.execute(text("ALTER TABLE appointments ADD COLUMN created_by INTEGER;"))
            else:
                conn.execute(text("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS created_by INTEGER;"))
    except Exception:
        pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
