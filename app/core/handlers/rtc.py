import uuid
from dataclasses import dataclass

from fastapi import WebSocket

from app.api.api_v1.validators import RTCWebSocketSerializer
from app.core.config import ANSWER_KEY, OFFER_KEY, SDP_KEY, SDP_TYPE_KEY
from app.core.handlers.cache import CacheHandler
from app.core.handlers.peers_management import SocketHandler


@dataclass()
class BaseRTCHandler:
    data: dict
    socket: WebSocket


@dataclass
class SocketSDPHandler(BaseRTCHandler):
    async def _set_key(self, key_type: str) -> bool:
        serializer: RTCWebSocketSerializer = RTCWebSocketSerializer(raw_data=self.data)
        if serializer.is_valid():
            unique_offer_key: str = f"{key_type}:{str(uuid.uuid4())}" if key_type == OFFER_KEY else ANSWER_KEY
            CacheHandler.set(unique_offer_key, serializer.validated_description_dict())
            return True
        return False

    async def _get_key(self, key: str) -> dict:
        tmp = CacheHandler.get(key)
        return CacheHandler.get(key)

    async def _send_socket_message(self, message: dict):
        await self.socket.send_json(message)

    async def process(self):
        if SDP_KEY in self.data:
            # set offer / answer
            if SDP_TYPE_KEY in self.data:
                sdp_type_key: str = self.data[SDP_TYPE_KEY]
                await self._set_key(sdp_type_key)

                response_message: dict = dict(action=SDP_KEY, type=sdp_type_key)
                # TODO: notify proper socket that answer is ready to be fetched!
                await SocketHandler.notify_sockets(response_message)
                return

            # get offer / answer
            if any(list(map(lambda x: x in self.data[SDP_KEY], [OFFER_KEY, ANSWER_KEY]))):
                key_to_get: str = self.data[SDP_KEY]
                sdp_description = await self._get_key(key_to_get)
                await self._send_socket_message(sdp_description)


@dataclass
class SocketICEHandler(BaseRTCHandler):
    async def process(self):
        print()
