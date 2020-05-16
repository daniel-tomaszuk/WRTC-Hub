from fastapi import APIRouter

from app.api.api_v1.endpoints import clients, health, hub

API_V1_PREFIX = "/api/v1"
BASE_V1_PREFIX = ""

core_router = APIRouter()

core_router.include_router(health.router, tags=["health"])
core_router.include_router(hub.router, prefix=API_V1_PREFIX, tags=["hub"])
core_router.include_router(clients.router, prefix=BASE_V1_PREFIX, tags=["hub"])
