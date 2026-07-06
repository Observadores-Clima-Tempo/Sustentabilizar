"""
Testes de segurança para o endpoint de evidências.

Verifica que:
1. GET /evidence/{id}/file sem token retorna 403
2. GET /evidence/{id}/file com token de usuário diferente retorna 403
3. GET /evidence/{id}/file com token do dono retorna 200
4. Admin pode acessar evidência de qualquer usuário
5. /uploads/* não está mais acessível (404) — mount estático removido
6. O campo file_url após upload aponta para o endpoint autenticado, não /uploads/
"""

import io
import struct
import uuid
import zlib
from datetime import date, datetime, timezone
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.dependencies import get_current_user, get_db
from app.core.security import create_access_token
from app.db.base import Base
from app.main import app
from app.models.evidence import Evidence
from app.models.user import User
from app.models.waste_record import WasteRecord

# ---------------------------------------------------------------------------
# Banco SQLite in-memory — StaticPool garante que todas as sessões compartilhem
# a mesma conexão e vejam os mesmos dados.
# ---------------------------------------------------------------------------
TEST_ENGINE = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=TEST_ENGINE, autoflush=False, autocommit=False)

# Tabelas necessárias para os testes (sem JSONB / tipos exclusivos de PostgreSQL)
TABLES_TO_CREATE = ["users", "waste_records", "evidences"]


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _png_1x1() -> bytes:
    """Gera um PNG 1x1 branco válido sem dependência de Pillow."""
    def chunk(name: bytes, data: bytes) -> bytes:
        c = name + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0))
    idat = chunk(b"IDAT", zlib.compress(b"\x00\xff\xff\xff"))
    iend = chunk(b"IEND", b"")
    return sig + ihdr + idat + iend


def _make_user(db, *, is_admin=False) -> User:
    # Usa hash placeholder — testes usam JWT direto, nunca verificam senha
    user = User(
        id=uuid.uuid4(),
        name="Test User",
        email=f"user_{uuid.uuid4().hex[:6]}@test.com",
        cpf=f"{uuid.uuid4().int % 10**11:011d}",
        password_hash="placeholder-not-a-real-hash",
        profile_type="pessoa_fisica",
        city="Rio de Janeiro",
        state="RJ",
        is_active=True,
        is_admin=is_admin,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _make_record(db, user: User) -> WasteRecord:
    record = WasteRecord(
        id=uuid.uuid4(),
        user_id=user.id,
        waste_type="papel",
        weight_kg=1.0,
        collection_frequency="semanal",
        collection_date=date(2026, 7, 6),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def _token(user: User) -> str:
    return create_access_token({"sub": str(user.id)})


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def setup_db():
    """Cria apenas as tabelas sem tipos exclusivos de PostgreSQL antes de cada teste."""
    tables = [Base.metadata.tables[t] for t in TABLES_TO_CREATE if t in Base.metadata.tables]
    Base.metadata.create_all(bind=TEST_ENGINE, tables=tables)
    yield
    Base.metadata.drop_all(bind=TEST_ENGINE, tables=tables)


@pytest.fixture()
def client():
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


# ---------------------------------------------------------------------------
# Testes de segurança
# ---------------------------------------------------------------------------

class TestEvidenceFileSecurity:
    """Testes do endpoint GET /api/v1/evidence/{id}/file"""

    def test_sem_token_retorna_403(self, client):
        """Acesso sem Authorization header deve ser bloqueado."""
        fake_id = uuid.uuid4()
        resp = client.get(f"/api/v1/evidence/{fake_id}/file")
        assert resp.status_code == 403

    def test_token_invalido_retorna_401(self, client):
        """Token JWT inválido deve ser rejeitado com 401."""
        resp = client.get(
            f"/api/v1/evidence/{uuid.uuid4()}/file",
            headers={"Authorization": "Bearer token-invalido"},
        )
        assert resp.status_code == 401

    def test_dono_pode_acessar(self, client, db, tmp_path):
        """Dono da evidência com token válido deve receber o arquivo."""
        owner = _make_user(db)
        record = _make_record(db, owner)

        # Cria arquivo físico temporário
        img_path = tmp_path / "ev.png"
        img_path.write_bytes(_png_1x1())

        evidence = Evidence(
            id=uuid.uuid4(),
            waste_record_id=record.id,
            user_id=owner.id,
            file_path=str(img_path),
            file_url=f"/api/v1/evidence/placeholder/file",
            file_name="ev.png",
            file_size_bytes=len(_png_1x1()),
            mime_type="image/png",
            captured_at=datetime(2026, 7, 6, tzinfo=timezone.utc),
        )
        db.add(evidence)
        db.commit()

        resp = client.get(
            f"/api/v1/evidence/{evidence.id}/file",
            headers={"Authorization": f"Bearer {_token(owner)}"},
        )
        assert resp.status_code == 200
        assert resp.headers["content-type"].startswith("image/png")

    def test_outro_usuario_retorna_403(self, client, db, tmp_path):
        """Usuário diferente do dono não pode acessar a evidência."""
        owner = _make_user(db)
        intruder = _make_user(db)
        record = _make_record(db, owner)

        img_path = tmp_path / "ev.png"
        img_path.write_bytes(_png_1x1())

        evidence = Evidence(
            id=uuid.uuid4(),
            waste_record_id=record.id,
            user_id=owner.id,
            file_path=str(img_path),
            file_url=f"/api/v1/evidence/placeholder/file",
            file_name="ev.png",
            file_size_bytes=100,
            mime_type="image/png",
            captured_at=datetime(2026, 7, 6, tzinfo=timezone.utc),
        )
        db.add(evidence)
        db.commit()

        resp = client.get(
            f"/api/v1/evidence/{evidence.id}/file",
            headers={"Authorization": f"Bearer {_token(intruder)}"},
        )
        assert resp.status_code == 403

    def test_admin_pode_acessar_qualquer_evidencia(self, client, db, tmp_path):
        """Admin deve conseguir acessar evidência de qualquer usuário."""
        owner = _make_user(db)
        admin = _make_user(db, is_admin=True)
        record = _make_record(db, owner)

        img_path = tmp_path / "ev.png"
        img_path.write_bytes(_png_1x1())

        evidence = Evidence(
            id=uuid.uuid4(),
            waste_record_id=record.id,
            user_id=owner.id,
            file_path=str(img_path),
            file_url=f"/api/v1/evidence/placeholder/file",
            file_name="ev.png",
            file_size_bytes=100,
            mime_type="image/png",
            captured_at=datetime(2026, 7, 6, tzinfo=timezone.utc),
        )
        db.add(evidence)
        db.commit()

        resp = client.get(
            f"/api/v1/evidence/{evidence.id}/file",
            headers={"Authorization": f"Bearer {_token(admin)}"},
        )
        assert resp.status_code == 200

    def test_evidencia_inexistente_retorna_404(self, client, db):
        """ID de evidência inexistente deve retornar 404, não 500."""
        user = _make_user(db)
        resp = client.get(
            f"/api/v1/evidence/{uuid.uuid4()}/file",
            headers={"Authorization": f"Bearer {_token(user)}"},
        )
        assert resp.status_code == 404

    def test_arquivo_sumiu_do_disco_retorna_404(self, client, db):
        """Evidência no banco mas arquivo físico ausente deve retornar 404."""
        owner = _make_user(db)
        record = _make_record(db, owner)

        evidence = Evidence(
            id=uuid.uuid4(),
            waste_record_id=record.id,
            user_id=owner.id,
            file_path="/tmp/arquivo-que-nao-existe-xyz.png",
            file_url="/api/v1/evidence/placeholder/file",
            file_name="ev.png",
            file_size_bytes=100,
            mime_type="image/png",
            captured_at=datetime(2026, 7, 6, tzinfo=timezone.utc),
        )
        db.add(evidence)
        db.commit()

        resp = client.get(
            f"/api/v1/evidence/{evidence.id}/file",
            headers={"Authorization": f"Bearer {_token(owner)}"},
        )
        assert resp.status_code == 404


class TestStaticMountRemoved:
    """Verifica que /uploads/* não está mais acessível diretamente."""

    def test_uploads_retorna_404(self, client):
        """Qualquer GET em /uploads/ deve retornar 404 — mount estático removido."""
        resp = client.get("/uploads/qualquer-imagem.jpg")
        assert resp.status_code == 404

    def test_uploads_com_uuid_retorna_404(self, client):
        resp = client.get(f"/uploads/{uuid.uuid4()}.png")
        assert resp.status_code == 404


class TestUploadEndpoint:
    """Verifica que o endpoint de upload atualiza file_url corretamente."""

    def test_upload_sem_token_retorna_403(self, client):
        data = io.BytesIO(_png_1x1())
        resp = client.post(
            f"/api/v1/evidence/upload?record_id={uuid.uuid4()}",
            files={"file": ("test.png", data, "image/png")},
        )
        assert resp.status_code == 403

    def test_file_url_aponta_para_endpoint_autenticado(self, client, db, tmp_path):
        """Após upload, file_url deve ser /api/v1/evidence/{id}/file."""
        owner = _make_user(db)
        record = _make_record(db, owner)

        fake_file_path = tmp_path / "uploaded.png"
        fake_file_path.write_bytes(_png_1x1())

        fake_meta = {
            "file_path": str(fake_file_path),
            "file_url": f"/uploads/some-uuid.png",  # valor antigo que será sobrescrito
            "file_name": "test.png",
            "file_size_bytes": len(_png_1x1()),
            "mime_type": "image/png",
            "captured_at": datetime(2026, 7, 6, tzinfo=timezone.utc),
        }

        with (
            patch("app.api.v1.evidence.save_evidence_file", return_value=fake_meta),
            patch("app.api.v1.evidence.certification_service.recalculate"),
        ):
            data = io.BytesIO(_png_1x1())
            resp = client.post(
                f"/api/v1/evidence/upload?record_id={record.id}",
                files={"file": ("test.png", data, "image/png")},
                headers={"Authorization": f"Bearer {_token(owner)}"},
            )

        assert resp.status_code == 201
        body = resp.json()
        assert body["file_url"].startswith("/api/v1/evidence/")
        assert body["file_url"].endswith("/file")
        assert "/uploads/" not in body["file_url"]
