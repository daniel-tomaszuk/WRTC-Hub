import logging
import os
from typing import List

from starlette.config import Config
from starlette.datastructures import CommaSeparatedStrings, Secret

logger = logging.getLogger("root logger")
logger.setLevel(logging.DEBUG)

BASE_DIR = os.path.dirname(os.path.realpath(__file__)).rsplit(os.sep, 1)[0]
# statics config
STATIC_URL = "/static"
STATIC_ROOT = BASE_DIR + "/static"

config = Config(".env")

PROJECT_NAME = config("webrtc-hub", default="webrtc-hub")
SECRET_KEY: Secret = config("SECRET_KEY", cast=Secret, default="test")
DEBUG = config("DEBUG", cast=bool, default=False)

ALLOWED_HOSTS: List[str] = config("ALLOWED_HOSTS", cast=CommaSeparatedStrings, default="*")

BASE_HOST_NAME = config("BASE_HOST_NAME", default="localhost:8000")

# Azure Tracer
# connection string taken from Azure App Insights
APPLICATIONINSIGHTS_CONNECTION_STRING = config("APPLICATIONINSIGHTS_CONNECTION_STRING", default="")

# WebRTC
# SDP Strings
ANSWER_KEY = "answer"
OFFER_KEY = "offer"
SDP_KEY = "sdp"
SDP_TYPE_KEY = "type"
ICE_CANDIDATE_KEY = "ice"
