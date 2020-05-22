from dataclasses import dataclass
from typing import Union

from fastapi import WebSocket

from app.api.api_v1.validators import RTCSessionDescriptionSerializable

ACTIVE_SOCKETS = []


class BaseRtcHandler:
    pass


@dataclass
class SocketHandler(BaseRtcHandler):
    @classmethod
    def register(cls, websocket: WebSocket):
        ACTIVE_SOCKETS.append(websocket)

    @classmethod
    def unregister(cls, websocket: WebSocket):
        ACTIVE_SOCKETS.remove(websocket)

    @classmethod
    def get_all_active_sockets(cls) -> list:
        return list(ACTIVE_SOCKETS)

    @classmethod
    async def notify_sockets(cls, message: Union[RTCSessionDescriptionSerializable, dict]):
        # TODO: implement filtering so not all sockets would be notified
        message_dict: dict = dict(message)
        [await websocket.send_json(message_dict) for websocket in ACTIVE_SOCKETS]

    def __str__(self):
        return "Active Sockets Handler Class"
