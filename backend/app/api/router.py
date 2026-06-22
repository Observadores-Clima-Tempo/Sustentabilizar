from fastapi import APIRouter

from app.api.v1 import auth, evidence, users, waste_records

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(waste_records.router, prefix="/waste-records", tags=["waste-records"])
api_router.include_router(evidence.router, prefix="/evidence", tags=["evidence"])
