import json
import uuid
from typing import Union

import pydantic
from fastapi import APIRouter, WebSocket
from starlette import status

from app.api.api_v1.enums import RTCActionEnum, RTCSubActionEnum, RTCTypeEnum
from app.api.api_v1.validators import ValidatedSocketPayload
from app.core.config import logger
from app.core.handlers.cache import CacheHandler
from app.core.handlers.peers_management import SocketHandler
from app.core.handlers.rtc import BaseRTCHandler

router = APIRouter()

SOCKET_BASE_URL = "/rtc"

ACTIVE_PEERS_KEY = "active_peer"


def get_cache_key(validated_data: ValidatedSocketPayload) -> str:
    uuid_key = str(validated_data.uuid_key) if validated_data.uuid_key else str(uuid.uuid4())
    cache_key: str = f"{uuid_key}:{validated_data.type.value}:{validated_data.sub_type.value}" if validated_data.sub_type else f"{uuid_key}:{validated_data.type.value}"
    return cache_key


@router.websocket(SOCKET_BASE_URL)
async def ws_rtc_sdp(websocket: WebSocket):
    try:
        await websocket.accept()
        SocketHandler.register(websocket)
        while True:  # prevents closure of a socket
            try:
                data: dict = await websocket.receive_json()
                validated_data: ValidatedSocketPayload = ValidatedSocketPayload(**data)
                await websocket.send_json(dict(status="accepted"))
            except (pydantic.ValidationError, json.JSONDecodeError, TypeError) as e:
                logger.error(f"Got error during validation of socket payload:\n{e}")
                await SocketHandler.unregister(websocket, code=status.WS_1000_NORMAL_CLOSURE)
                return

            cache_key: str = get_cache_key(validated_data)
            if validated_data.action == RTCActionEnum.set:
                # TODO: refactor with Redis
                while cache_key in CacheHandler.get_all_keys():
                    cache_key += ":answer"

                await BaseRTCHandler.set_key(cache_key, validated_data.data)
                await SocketHandler.notify_sockets(message=dict(action=RTCActionEnum.set.value, uuid_key=cache_key))

            elif validated_data.action == RTCActionEnum.get:
                data: Union[dict, str, None] = CacheHandler.get(cache_key)
                data = data if data and data != "null" else {}
                data.setdefault("uuid_key", str(validated_data.uuid_key))
                if (
                    validated_data.type == RTCTypeEnum.sdp
                    and validated_data.sub_type == RTCSubActionEnum.offer
                    or validated_data.type == RTCTypeEnum.ice
                ):
                    # if SDP offer - return ICE candidates along with it
                    ice_candidates: list = []
                    for ice_type in [":tcp", ":udp", ""]:
                        ice_key: str = f"{validated_data.uuid_key}:ice{ice_type}"
                        if validated_data.sub_type == RTCSubActionEnum.answer:
                            ice_key += ":answer"
                        ice_candidates.append(CacheHandler.get(ice_key))
                    data.setdefault("ice_data", ice_candidates)
                await websocket.send_json(data)

    finally:
        await SocketHandler.unregister(websocket, code=status.WS_1000_NORMAL_CLOSURE)
