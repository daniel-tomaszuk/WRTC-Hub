from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

from app.core import config
from app.core.routes import core_router


def get_application() -> FastAPI:
    application = FastAPI(title=config.PROJECT_NAME, debug=config.DEBUG)

    application.add_middleware(
        CORSMiddleware,
        allow_origins=config.ALLOWED_HOSTS or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(core_router)
    if Path(config.STATIC_ROOT).exists():
        application.mount(config.STATIC_URL, StaticFiles(directory=config.STATIC_ROOT), name="static")

    return application


app = get_application()

if __name__ == "__main__":
    # entry point for starting the app as python script - `python main.py` will start the worker
    uvicorn.run(app, host="0.0.0.0", port=8000)
