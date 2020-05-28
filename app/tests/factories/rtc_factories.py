import random
import uuid

from app.api.api_v1.enums import RTCActionEnum, RTCTypeEnum
from app.tests.factories.base import BaseFactory


class RTCSessionDescriptionFactory(BaseFactory):
    def get_example_session_description(self) -> dict:
        example_sdp_string = self.faker.paragraph()
        example_description_type = "offer"
        return dict(sdp=example_sdp_string, type=example_description_type)


class SocketPayloadFactory(BaseFactory):
    def get_valid_payload(self) -> dict:
        action_key_value: str = random.choice(RTCActionEnum.get_members())
        type_key_value: str = random.choice(RTCTypeEnum.get_members())
        data_key_value: dict = {}
        return dict(action=action_key_value, type=type_key_value, data=data_key_value, uuid=str(uuid.uuid4()))
