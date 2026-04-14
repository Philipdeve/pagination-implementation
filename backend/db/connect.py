from sqlmodel import create_engine
from db.config import DATABASE_URL

engine = create_engine(DATABASE_URL)