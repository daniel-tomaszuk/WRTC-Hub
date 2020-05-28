import pytest
from starlette.testclient import TestClient
from starlette.websockets import WebSocketDisconnect

from app.api.api_v1.endpoints.hub_sockets import SOCKET_BASE_URL
from app.api.api_v1.prefixes import WEB_SOCKETS_V1_PREFIX
from app.tests.factories.rtc_factories import SocketPayloadFactory


class TestHubSockets:
    url = WEB_SOCKETS_V1_PREFIX + SOCKET_BASE_URL

    def test_send_valid_sdp_offer_payload(self, client: TestClient):
        valid_payload = SocketPayloadFactory().get_valid_payload()
        try:
            with client.websocket_connect(self.url) as socket:
                socket.send_json(valid_payload)
                response: dict = socket.receive_json()
        except WebSocketDisconnect:
            pass

        assert response.get("status")
        assert response.get("status") == "accepted"

    @pytest.mark.parametrize("invalid_payload", [dict(test=""), dict(), dict(sdp=""), "testing_string", "",])
    def test_send_invalid_sdp_offer_payload(self, client: TestClient, invalid_payload):
        try:
            with client.websocket_connect(self.url) as socket:
                socket.send_json(invalid_payload)
                response: dict = socket.receive_json()
        except WebSocketDisconnect:
            pass
        assert response.get("status")
        assert response.get("status") == "closing"
