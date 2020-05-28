import pydantic
import pytest

from app.api.api_v1.validators import ValidatedSocketPayload
from app.tests.factories.rtc_factories import RTCSessionDescriptionFactory


class TestSocketPayload:
    description_factory = RTCSessionDescriptionFactory()

    @pytest.mark.parametrize(
        "proper_payload",
        [
            dict(action="get", type="sdp", data=""),
            dict(action="get", type="ice", data=""),
            dict(action="set", type="sdp", data=""),
            dict(action="set", type="ice", data=""),
        ],
    )
    def test_valid_session_description_keys_validator(self, proper_payload):
        ValidatedSocketPayload(**proper_payload)

    @pytest.mark.parametrize(
        "proper_payload",
        [
            dict(action="gett", type="sdp", data=""),
            dict(action="sett", type="sdp", data=""),
            dict(action="get", type="icee", data=""),
            dict(action="get", type="sdpp", data=""),
            dict(actionn="set", type="ice", data=""),
            dict(action="get", typee="ice", data=""),
            dict(action="set", type="sdp", dataa=""),
        ],
    )
    def test_invalid_session_description_keys_validator(self, proper_payload):
        with pytest.raises(pydantic.ValidationError):
            ValidatedSocketPayload(**proper_payload)
