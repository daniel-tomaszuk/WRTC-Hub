from fastapi import APIRouter, WebSocket

from app.core.config import SDP_KEY
from app.core.handlers.peers_management import SocketHandler
from app.core.handlers.rtc import SocketSDPHandler

router = APIRouter()

SOCKET_BASE_URL = "/rtc"


ACTIVE_PEERS_KEY = "active_peer"


@router.websocket(SOCKET_BASE_URL)
async def ws_rtc_sdp(websocket: WebSocket):
    await websocket.accept()
    SocketHandler.register(websocket)
    try:
        while True:
            data: dict = await websocket.receive_json()
            sdp_handler: SocketSDPHandler = SocketSDPHandler(data, websocket)
            # TODO: check what has arrived, perform actions on that (SDP / ICE - SET / GET)
            if SDP_KEY in data:
                # set offer / answer in the cache
                await sdp_handler.process()

    finally:
        SocketHandler.unregister(websocket)
