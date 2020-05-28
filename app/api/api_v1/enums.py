from enum import Enum


class BaseStrEnum(str, Enum):
    @classmethod
    def get_members(cls) -> list:
        """
        Returns list of keys for Enum class.
        """
        return list(cls.__members__.keys())


class RTCActionEnum(BaseStrEnum):
    get = "get"
    set = "set"


class RTCSubActionEnum(BaseStrEnum):
    # SDP sub types
    offer = "offer"
    answer = "answer"

    # ICE sub types
    tcp = "tcp"
    udp = "udp"


class RTCTypeEnum(BaseStrEnum):
    sdp = "sdp"
    ice = "ice"
