from dataclasses import dataclass
from typing import Union

from fastapi import WebSocket

from app.core.handlers.cache import CacheHandler


@dataclass()
class BaseRTCHandler:
    @classmethod
    async def set_key(cls, key: str, value: Union[str, dict]) -> bool:
        return CacheHandler.set(key, value)

    @classmethod
    async def get_key(cls, key: str) -> Union[str, dict]:
        return await CacheHandler.get(key)

    @classmethod
    async def send_message(cls, socket: WebSocket, message: Union[str, dict]) -> bool:
        await socket.send_json(message)
        return True
