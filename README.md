# WRTC-Hub

Web RTC peer2peer connections hub.
For now acts as POC (proof of concept) for using WebRTC as anonymous peer to peer connection handler.
It's still in development (maybe forever :-) ). Right now it creates single connection between two browsers and allows
sending small files. No DB beside Redis (as temporary cache) is required. Shared files aren't saved anywhere - it's
possible to access them as long as person sharing them has his/hers browser open (has open socket connection with BE
server).

## TODO:
- create frontend using FE framework (vue.js or angularJS),
- create link searching mechanism so it's possible to download the file only when someone has proper link / code / uuid,
- create proper page for sharing files,
- create proper page for displaying list of files / links,
- more unit tests,
- write load tests,
- other.

## Tech Stack

- Python3.8
- FastAPI
- JavaScript
- WebRTC
- Redis.

## Setup

List of environmental variables can be found in `.env_example` file:
```bash
SECRET_KEY=test
DEBUG=True
ALLOWED_HOSTS=*

# REDIS ENV
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0
```

Project is looking for `.env` file in the same dir as `.env_example`. Be sure to create one.

## Starting the project
Project has `Makefile` that allows for fast local setup:
- `make update-deps` - installs dependencies,
- `make up` - uses Docker to start the project,
- `make run-tests` - run unit tests.


## MIT License

Copyright (c) 2020 Daniel Tomaszuk

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
