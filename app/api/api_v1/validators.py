"""
Serializers used for checking Web Socket bodies.
"""
from typing import Union
from uuid import UUID

from pydantic import BaseModel, Field

from app.api.api_v1.enums import RTCActionEnum, RTCSubActionEnum, RTCTypeEnum


class BaseSerializer(BaseModel):
    pass


class ValidatedSocketPayload(BaseSerializer):
    action: RTCActionEnum
    type: RTCTypeEnum
    sub_type: Union[RTCSubActionEnum, None] = Field(None)
    data: Union[str, dict, None]
    uuid_key: Union[UUID, None] = Field(None)


# class RTCSessionDescriptionSerializable(RTCSessionDescription):
#     def dict(self) -> dict:
#         return dict(type=self.type, sdp=self.sdp)
#
#     def json(self) -> str:
#         return ujson.dumps(self.dict())
#
#
# @dataclass
# class RTCWebSocketSerializer(BaseSerializer):
#
#     raw_data: Union[RTCOfferSchemaOut, dict]
#     session_description: Union[RTCSessionDescriptionSerializable, None] = None
#
#     def __post_init__(self):
#         if type(self.raw_data) is RTCOfferSchemaOut:
#             self.raw_data: dict = ujson.loads(self.raw_data.data.json())
#
#     def is_valid(self) -> bool:
#         if "sdp" not in self.raw_data:
#             raise ValidationError
#
#         if "type" not in self.raw_data:
#             raise ValidationError
#
#         self.session_description = RTCSessionDescriptionSerializable(
#             sdp=self.raw_data["sdp"], type=self.raw_data["type"]
#         )
#         return True
#
#     def validated_description_dict(self) -> dict:
#         if self.session_description:
#             return dict(sdp=self.session_description.sdp, type=self.session_description.type)
#         raise ValidationError("You must validate the data before accessing validated description.")
