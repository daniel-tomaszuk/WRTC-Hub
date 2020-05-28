from dataclasses import dataclass

from fastapi import WebSocket

ACTIVE_SOCKETS = []


class BaseRtcHandler:
    pass


@dataclass
class SocketHandler(BaseRtcHandler):
    @classmethod
    def register(cls, websocket: WebSocket):
        ACTIVE_SOCKETS.append(websocket)

    @classmethod
    async def unregister(cls, websocket: WebSocket, code: int):
        # 1) try to remove socket from active sockets list
        if websocket in ACTIVE_SOCKETS:
            ACTIVE_SOCKETS.remove(websocket)

        # 2) try to send "closing" message and close the socket
        try:
            await websocket.send_json(dict(status="closing"))
            await websocket.close(code)
        except RuntimeError:
            pass

    @classmethod
    def get_all_active_sockets(cls) -> list:
        return list(ACTIVE_SOCKETS)

    @classmethod
    # async def notify_sockets(cls, message: Union[RTCSessionDescriptionSerializable, dict]):
    async def notify_sockets(cls, message: dict):
        # TODO: implement filtering so not all sockets would be notified
        message_dict: dict = dict(message)
        [await websocket.send_json(message_dict) for websocket in ACTIVE_SOCKETS]

    def __str__(self):
        return "Active Sockets Handler Class"
