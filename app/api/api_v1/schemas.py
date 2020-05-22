from typing import Union

from pydantic import Field

from app.core.schemas import BaseSchema


class RTCOfferSchema(BaseSchema):

    type: str = Field(...)
    sdp: str = Field(...)


class RTCOfferSchemaOut(BaseSchema):
    data: Union[RTCOfferSchema, None] = Field(None)
