import logo from './logo.svg';
import './App.css';
import io from 'socket.io-client';
import Webcam from "react-webcam";
import { useCallback, useEffect, useRef, useState } from 'react';
import {useDropzone} from 'react-dropzone';



function App() {

  const {acceptedFiles, getRootProps, getInputProps} = useDropzone();

  const [mode, setMode] = useState('camera')
  const [recordedChunks, setRecordedChunks] = useState([]);

  const [rec_data, setRecData] = useState({})
  const [box_data, setBoxData] = useState({})

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const boxRef = useRef(null);

  const [socket, setSocket] = useState(null);

  useEffect(() => {




    const boxCanvas = boxRef.current;
    const boxContext = boxCanvas.getContext('2d');

    
    boxCanvas.width = webcamRef.current.videoWidth
    boxCanvas.height = webcamRef.current.videoHeight
    
    boxContext.lineWidth = "4"
    boxContext.strokeStyle = "lightblue";


    boxContext.strokeRect(box_data?.x, box_data?.y, box_data?.w, box_data?.h)



  }, [box_data]);

  const constraints = {
      audio: false,
      video: {
          width: {min: 640, ideal: 1280, max: 1920},
          height: {min: 480, ideal: 720, max: 1080}
      }
  };


  //Get camera video

  useEffect(() => {

    // var video = document.querySelector("#myVideo");

    function handleVideo(stream) {
      webcamRef.current.srcObject  = stream;
      webcamRef.current.play();

    }

    function videoError() {

    }

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

    if (navigator.getUserMedia) {   
      navigator.getUserMedia({video: true}, handleVideo, videoError)
    }

    // .then(stream => {
    //     webcamRef.current.srcObject = stream;
    //     console.log("Got local user video");
  
    // })
    // .catch(err => {
    //     console.log('navigator.getUserMedia error: ', err)
    // });

    webcamRef.current.onplaying = (e) => {
      
      async function postBox(file) {
        // console.log(1)
        //Set options as form data
        let formdata = new FormData();
        formdata.append("file", file);

          await fetch(`http://localhost:8001/boxes`, {
            method: 'POST',
            body: formdata
          })
          .then(res => res.json())
          .then(json => {
            // console.log(json)
            
            // console.log('postBox')
            setBoxData(json)
          })
          .catch(e => {
            console.log(e)
          })

        
        
    }

      async function postFile(file, op_name) {
        //Set options as form data
        let formdata = new FormData();
        formdata.append("file", file);
        // 141.8.195.228
        await fetch(`http://localhost:8000/files`, {
          method: 'POST',
          body: formdata
        })
        .then(res => res.json())
        .then(json => {
          setRecData(json)
          console.log(json)
          // console.log('postFile')
        })
        .catch(e => {
          console.log(e)
        })

        
        
    }

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      
      const boxCanvas = boxRef.current;
      const boxContext = boxCanvas.getContext('2d');

      

      setInterval(() => {

        
        canvas.width = webcamRef.current.videoWidth
        canvas.height = webcamRef.current.videoHeight
        
        
        context.drawImage(webcamRef.current, 0, 0, webcamRef.current.videoWidth, webcamRef.current.videoHeight)
        canvas.toBlob((file) => {postFile(file, 'video')}, 'image/jpeg')

        // console.log(rec_data?.region?.x)
        
        // ws.send(1)


      }, 3000)


      setInterval(() => {

        
        canvas.width = webcamRef.current.videoWidth
        canvas.height = webcamRef.current.videoHeight
        
        
        context.drawImage(webcamRef.current, 0, 0, webcamRef.current.videoWidth, webcamRef.current.videoHeight)
        canvas.toBlob((file) => {postBox(file)}, 'image/jpeg')

        // console.log(rec_data?.region?.x)
        
        // ws.send(1)


      }, 150)


  }
        



  }, [navigator])

        
    
  const emotions = {
    'sad': 'Грусть',
    'angry': 'Злость',
    'fear': 'Страх',
    'neutral': 'Нейтрально',
    'surprise': 'Удивление',
    'happy': 'Радость',
  }

  const races = {
    'white': 'Европеоидная',
    'asian': 'Азиатская',
    'indian': 'Индийская',
    'black': 'Афроамериканская',
    'middle eastern': 'Средиземноморская',
    'latino hispanic': 'Латинская',
  }

  

  const data = [
    {color: '#780E9D', type: 'Эмоция', value: emotions[rec_data?.dominant_emotion], icon: '🙂'},
    {color: '#EC2929', type: 'Раса', value: races[rec_data?.dominant_race], icon: '👨'},
    // {color: '#F612C4', type: 'Пол', value: 'Мужской', icon: '👔'},
    // {color: '#2A2', type: 'Тест', value: 'Хз чо писать', icon: '🙂'},
  ]



  const files = acceptedFiles.map(file => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));



  return (
    <div className="App">
      <header className="App-header">
        
      </header>
      <main>
          <div className='data_block' style={{marginTop: 160}}>
            {/* <div className='switcher'>
                <button className={mode == 'camera' && 'active'} onClick={e => {setMode('camera')}}>
                    Камера
                </button>
                <button className={mode == 'photo' && 'active'} onClick={e => {setMode('photo')}}>
                    Фото
                </button>
            </div> */}
            {
              mode == 'camera' ? (
                <>
                  {/* <div className='camera_block' style={{position: 'relative', zIndex: 0, width: canvasRef?.current?.width, height: canvasRef?.current?.height}} >

                  
                  
                  </div> */}
                  <div className='camera_block' style={{position: 'relative'}}>


                    {/* <Webcam 
                      // id="sourceVideo"
                      style={{zIndex: 10}}
                      screenshotFormat="image/jpeg"
                      onUserMedia={(e) => handleMedia(e)}
                      ref={webcamRef}
                    /> */}

                    <video id="myVideo" style={{zIndex: 10}} ref={webcamRef} ></video>
                    
                    <canvas style={{position: 'absolute', top: 0, left: 0, zIndex: 0}} ref={canvasRef}>
                    </canvas>
                    <canvas style={{position: 'absolute', top: 0, left: 0, zIndex: 20}} ref={boxRef}></canvas>
                  </div>
                </>
              ) : (
                <section className="upload_block">
                  <div {...getRootProps({className: 'dropzone'})}>
                    <input {...getInputProps()} />
                    <p style={{fontSize: 36, fontWeight: 700}}>ПЕРЕТАЩИТЕ</p>
                    <p style={{fontSize: 20, fontWeight: 700}}>или</p>
                    <p style={{fontSize: 36, fontWeight: 700}}>НАЖМИТЕ</p>
                    <p style={{fontSize: 20, fontWeight: 700}}>для загрузки файлов</p>
                  </div>
                  <aside>
                    <ul>{files}</ul>
                  </aside>
                </section>
              )
            }
          </div>
          <div className='info_block'>
              <h2>РЕЗУЛЬТАТЫ РАСПОЗНАВАНИЯ</h2>
              <div className='recognition_results'>
                 {
                    rec_data?.age && (
                      <div className='recognition_card'>
                      <div className='features'>
                        {data.map(item => (
                          <div key={item.color} className='features_item' >
                            <div className='features_item__header' style={{background: item.color}}>
                              <p>{item.type}</p>
                            </div>
                            <div className='features_item__body' style={{border: `2px solid ${item.color}`}}>
                                <div className='feature_icon'>
                                  {item.icon}
                                </div>
                                <div className='feature_text'>
                                  {item.value}
                                </div>
                            </div>
                          </div>
                        ))}
                        <div className='features_item' >
                            <div className='features_item__header' style={{background: '#333'}}>
                              <p>Пол</p>
                            </div>
                            <div className='features_item__body' style={{border: `2px solid #333`}}>
                                <div className='feature_icon'>
                                👔
                                </div>
                                <div className='feature_text'>
                                  {rec_data?.gender == 'Woman' ? 'Женский' : 'Мужской'}
                                </div>
                            </div>
                          </div>
                        
                      </div>
                      <div className='card_footer'>
                          <div className='card_footer__age'>
                              <span>{rec_data?.age && rec_data?.age}</span> {rec_data?.age && 'лет'}
                          </div>
                          <div className='card_footer__number'>
                              1
                          </div>
                      </div>
                    </div>
                    )
                 }
              </div>
          </div>
      </main>
    </div>
  );
}

export default App;
