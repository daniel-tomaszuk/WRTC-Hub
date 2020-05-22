from fastapi import APIRouter

from app.api.api_v1.endpoints import clients, health, hub, hub_sockets
from app.api.api_v1.prefixes import API_V1_PREFIX, BASE_V1_PREFIX, WEB_SOCKETS_V1_PREFIX

core_router = APIRouter()

core_router.include_router(health.router, tags=["health"])
core_router.include_router(hub.router, prefix=API_V1_PREFIX, tags=["hub"])
core_router.include_router(hub_sockets.router, prefix=WEB_SOCKETS_V1_PREFIX, tags=["hub-sockets"])
core_router.include_router(clients.router, prefix=BASE_V1_PREFIX, tags=["clients"])
