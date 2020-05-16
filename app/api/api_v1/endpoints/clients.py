from fastapi import APIRouter, Request

from app.core.templates import templates

router = APIRouter()

BASE_URL = "/"
SEND_URL = "/send"
RECEIVE_URL = "/receive"


@router.get(BASE_URL)
async def base(request: Request):
    return templates.TemplateResponse("base/base.html", {"request": request})


@router.get(SEND_URL)
async def send(request: Request):
    return templates.TemplateResponse("send/send.html", {"request": request})


@router.get(RECEIVE_URL)
async def receive(request: Request):
    return templates.TemplateResponse("receive/receive.html", {"request": request})
