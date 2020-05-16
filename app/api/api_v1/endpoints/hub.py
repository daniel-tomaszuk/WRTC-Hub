from fastapi import APIRouter

router = APIRouter()

SDP_URL = "/sdp"


@router.post(SDP_URL)
async def sdp(request_payload: dict) -> dict:
    return {}
