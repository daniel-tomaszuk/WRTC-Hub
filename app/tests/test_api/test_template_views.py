from starlette import status

from app.api.api_v1.endpoints.clients import BASE_URL
from app.core.routes import BASE_V1_PREFIX


class TestTemplateViews:
    def test_base_view(self, client):
        url = BASE_V1_PREFIX + BASE_URL
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK
