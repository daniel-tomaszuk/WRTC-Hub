import json

from starlette import status

from app.api.api_v1.endpoints.health import CHECK_HEALTH_URL


class TestHealthEndpoint:
    """
    Check health endpoint.
    """

    def test_health_status(self, client):
        response = client.get(CHECK_HEALTH_URL)
        assert response.status_code == status.HTTP_200_OK

    def test_health_payload(self, client):
        response = client.get(CHECK_HEALTH_URL)
        payload = json.loads(response.content)
        assert payload == {}
