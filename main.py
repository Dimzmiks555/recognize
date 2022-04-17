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
    

@app.post("/files/")
async def create_file(file: bytes = File(...)):
    # print(formData)
    # def data_uri_to_cv2_img(uri):
    #     encoded_data = uri.split(',')[1]
    #     nparr = np.fromstring(base64.b64decode(encoded_data), np.uint8)
    #     img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    #     return img

    # img = data_uri_to_cv2_img(file)

    # based = base64.b64encode(file)

    # print(based)
    

    # nparr = np.fromfile(file, np.uint8)
    # base64.b64decode(file).decode()

    nparr = np.fromstring(file, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # img_grey = cv2.imdecode(nparr, cv2.COLOR_BGR2GRAY)

    # await asyncio.wait([ws.send_text("notification!") for ws in clients])

    

    # with open('box.json', 'w') as file:
    #         json.dump(bounder_box, file, indent=4, ensure_ascii=False)
        

    # SOCKET_IO_HOST = "127.0.0.1"
    # SOCKET_IO_PORT = 5000

    # socket_io_url = 'ws://' + SOCKET_IO_HOST + ':' + str(SOCKET_IO_PORT) + '/socket.io/?EIO=3&transport=websocket'


    # ws = websocket.create_connection(socket_io_url)

    # with SocketIO('127.0.0.1', 5000) as socketIO:
    #     socketIO.emit('message', {'xxx': 'yyy'})
        # socketIO.wait_for_callbacks(seconds=1)

    # ws.send('bounder_box')
    data = await face_analyze(img)
    print(data)
    # print(bounder_box)

    # img = data_uri_to_cv2_img(file)

    # image_as_bytes = str.encode(formData)  # convert string to bytes
    # b64encoded_str = base64.b64decode(formData)  # decode base64string
    # file_bytes = np.fromstring(b64encoded_str, dtype=np.uint8)
    # img = cv2.imdecode(file_bytes, flags=cv2.IMREAD_UNCHANGED) #Here as well I get returned nothing
    
    # cv2.imshow('test', img)
    # cv2.waitKey(1)
    return data




@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        story = await websocket.receive_text()
        data = {'test': '1'}
        
        with open('box.json', 'r') as file:
            box_json = iter(json.loads(file.read()))
        payload = box_json
        print(data, payload)
# Exmaple out put of sentiment_analysis function: {'compound_score': 0.5856095238095237, 'correlation_score': 0.8736042200587304}

        await websocket.send_json(json.dumps(data))


if __name__ == '__main__':
    uvicorn.run("main:app", host="127.0.0.1", port=8000, access_log=False)





