from fastapi import APIRouter

router = APIRouter()

CHECK_HEALTH_URL = "/health"


@router.get(CHECK_HEALTH_URL)
async def health() -> dict:
    """
    Reports service health status.
    :return: Empty JSON Object.
    :rtype: `python:dict`
    """
    return {}
