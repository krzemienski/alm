from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.session import engine


def init_db() -> None:
    """
    Initialize the database by creating all tables.
    """
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
