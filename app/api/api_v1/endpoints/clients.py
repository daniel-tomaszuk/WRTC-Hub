from fastapi import APIRouter, Request

from app.core.templates import templates

router = APIRouter()

BASE_URL = "/"


@router.get(BASE_URL)
async def base(request: Request):
    return templates.TemplateResponse("base/base.html", {"request": request})
