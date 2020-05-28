from starlette import status
from starlette.testclient import TestClient

from app.api.api_v1.endpoints.clients import BASE_URL
from app.core.routes import BASE_V1_PREFIX


class TestTemplateViews:
    url = BASE_V1_PREFIX + BASE_URL

    def test_base_view(self, client: TestClient):
        response = client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
