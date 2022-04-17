import asyncio
import cv2
import uvicorn
import matplotlib.pyplot as plt
import base64
import numpy as np
import json
from PIL import Image
from fastapi import FastAPI, File, UploadFile, Form, Depends
from fastapi.responses import StreamingResponse
from fastapi.templating import Jinja2Templates
from fastapi import Request
from fastapi import WebSocket
from fastapi.middleware.cors import CORSMiddleware
from zmq import Socket
from recognition.main import face_analyze
from socketIO_client import SocketIO, LoggingNamespace
import websocket


app = FastAPI()
ws_clients = []
templates = Jinja2Templates(directory="templates")

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
    '*'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.post("/boxes/")
async def create_file(file: bytes = File(...)):
    nparr = np.fromstring(file, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')

    faces = face_cascade.detectMultiScale(img, 1.3, 5)

    bounder_box = {}

    if len(faces) != 0:
        (x, y, w, h) = faces[0]
        bounder_box['x'] = float(x)
        bounder_box['y'] = float(y)
        bounder_box['w'] = float(w)
        bounder_box['h'] = float(h)

    return bounder_box
    




if __name__ == '__main__':
    uvicorn.run("main:app", host="127.0.0.1", port=8001, access_log=False)





