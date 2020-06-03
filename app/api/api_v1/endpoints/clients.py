from fastapi import APIRouter, Request

from app.api.api_v1.endpoints.hub_sockets import SOCKET_BASE_URL
from app.api.api_v1.prefixes import WEB_SOCKETS_V1_PREFIX
from app.core.config import BASE_HOST_NAME, SDP_KEY
from app.core.handlers.cache import CacheHandler
from app.core.templates import templates

router = APIRouter()

BASE_URL = "/"
SEND_URL = "/send"
RECEIVE_URL = "/receive"


@router.get(BASE_URL)
async def base(request: Request):
    context: dict = dict(request=request)
    return templates.TemplateResponse("base/base.html", context)


@router.get(SEND_URL)
async def send(request: Request):
    base_ws_url = "ws://" + BASE_HOST_NAME + WEB_SOCKETS_V1_PREFIX + SOCKET_BASE_URL
    context: dict = dict(request=request, ws_url=base_ws_url)
    return templates.TemplateResponse("send/send.html", context)


@router.get(RECEIVE_URL)
async def receive(request: Request):
    base_ws_url = "ws://" + BASE_HOST_NAME + WEB_SOCKETS_V1_PREFIX + SOCKET_BASE_URL
    context: dict = dict(
        request=request, ws_url=base_ws_url, sdp_key=SDP_KEY, offer_keys=CacheHandler.get_offer_keys(),
    )
    return templates.TemplateResponse("receive/receive.html", context)
