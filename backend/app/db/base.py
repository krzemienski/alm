# Import all the models, so that Base has them before being
# imported by Alembic
from app.db.base_class import Base  # noqa
from app.models.awesome_list import AwesomeList  # noqa
from app.models.category import Category  # noqa
from app.models.project import Project  # noqa
