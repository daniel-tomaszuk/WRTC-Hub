from app.api.api_v1.validators import RTCWebSocketSerializer
from app.tests.factories.rtc_factories import RTCSessionDescriptionFactory


class TestRTCSessionDescriptionValidator:
    description_factory = RTCSessionDescriptionFactory()

    def test_proper_session_description_keys_validator(self):
        example_session_description: dict = self.description_factory.get_example_session_description()
        serializer = RTCWebSocketSerializer(raw_data=example_session_description)
        assert serializer.is_valid()
