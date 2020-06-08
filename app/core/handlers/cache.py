from dataclasses import dataclass
from typing import List, Union

import redis
import ujson

from app.core.config import OFFER_KEY, REDIS_DB, REDIS_HOST, REDIS_KEY_LIVE_TIME, REDIS_PORT

redis = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB)


@dataclass
class BaseHandlerCache:
    expire: int = REDIS_KEY_LIVE_TIME


class CacheHandler(BaseHandlerCache):
    @classmethod
    def set(cls, key: str, value: Union[dict, str]) -> bool:
        return redis.set(key, ujson.dumps(value), ex=cls.expire)

    @classmethod
    def get(cls, key: str) -> Union[dict, str, None]:
        try:
            return ujson.loads(redis.get(key))
        except TypeError:
            return

    @staticmethod
    def get_all_keys() -> List[str]:
        all_keys = [key.decode("utf-8") for key in redis.keys()]
        return all_keys

    @staticmethod
    def get_offer_keys():
        return [key.decode("utf-8") for key in redis.keys(pattern=f"*{OFFER_KEY}*")]

    def __str__(self):
        return "Cache Handler Class"
