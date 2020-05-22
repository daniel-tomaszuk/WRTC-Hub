from typing import Any

from app.core.config import OFFER_KEY

DUMMY_CACHE = {}


class BaseHandlerCache:
    pass


class CacheHandler(BaseHandlerCache):
    @classmethod
    def set(cls, key: str, value: Any):
        DUMMY_CACHE.setdefault(key, value)

    @classmethod
    def get(cls, key: str):
        return DUMMY_CACHE.get(key, None)

    @staticmethod
    def get_all_offer_keys():
        return [key for key in DUMMY_CACHE.keys() if OFFER_KEY in key]

    def __str__(self):
        return "Cache Handler Class"
