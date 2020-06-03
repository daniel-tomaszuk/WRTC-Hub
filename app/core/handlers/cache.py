from typing import Any

from app.core.config import OFFER_KEY

DUMMY_CACHE = {}


class BaseHandlerCache:
    pass


class CacheHandler(BaseHandlerCache):
    @classmethod
    def set(cls, key: str, value: Any) -> bool:
        DUMMY_CACHE.setdefault(key, value)
        return True

    @classmethod
    def get(cls, key: str):
        return DUMMY_CACHE.get(key, None)

    @staticmethod
    def get_all_keys():
        return [key for key in DUMMY_CACHE.keys()]

    @staticmethod
    def get_offer_keys():
        return [key for key in DUMMY_CACHE.keys() if OFFER_KEY in key]

    def __str__(self):
        return "Cache Handler Class"
