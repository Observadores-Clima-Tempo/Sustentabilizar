from fastapi import APIRouter

from app.api.v1 import admin, auth, certification, checklist, config, evidence, users, waste_records

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(waste_records.router, prefix="/waste-records", tags=["waste-records"])
api_router.include_router(evidence.router, prefix="/evidence", tags=["evidence"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(config.router, prefix="/config", tags=["config"])
api_router.include_router(checklist.router, prefix="/checklist", tags=["checklist"])
api_router.include_router(certification.router, prefix="/certification", tags=["certification"])
