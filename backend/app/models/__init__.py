# Importar todos os modelos aqui garante que o Alembic os detecte na autogeneração
from app.models.user import User  # noqa: F401
from app.models.waste_record import WasteRecord  # noqa: F401
from app.models.evidence import Evidence  # noqa: F401
