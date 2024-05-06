const VIDEO_CONFIG = {
  audio: true,
  video: true,
};
let recorder;
let chunks = [];

const backgroundImg = document.querySelector('.no-signal');
const videoEle = document.getElementById('video-screen');
const labelRecord = document.getElementById('record-label');
const [btnStart, btnPinP] = document.querySelectorAll('.action div');

btnStart.addEventListener('click', async () => {
  try {
    let isRecording = btnStart.classList.contains('recording');
    if (isRecording) {
      btnStart.classList.remove('recording');
      btnStart.innerText = 'Downloading...';
      stopRecording();
    } else {
      shareScreen();
      btnStart.classList.add('recording');
      btnStart.innerText = '💽 Recording...';
    }
  } catch (error) {
    console.log(error.message);
  }
});

btnPinP.addEventListener('click', createPicInPic);

async function shareScreen() {
  const sharedScreen =
    (await navigator.mediaDevices.getDisplayMedia(VIDEO_CONFIG)) || null;
  videoEle.srcObject = sharedScreen;
  start();
  if (!backgroundImg.classList.contains('d-none')) {
    backgroundImg.classList.add('d-none');
  }
}

async function start() {
  console.log('Start recording');
  let stream;
  if (videoEle.srcObject) {
    stream = videoEle.srcObject;
  }
  recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp8,opus',
  });

  recorder.start(1000);
  recorder.ondataavailable = ({ data }) => {
    if (data.size > 0) {
      console.log(data.size);
      chunks.push(data);
    }
  };
  recorder.onstop = downloandVideo;
  recorder.onstart = () => {
    btnPinP.click();
  };
}

function stopRecording() {
  if (!recorder || !videoEle.srcObject) {
    return;
  }

  let tracks = videoEle.srcObject.getTracks();
  tracks.forEach((track) => track.stop());
  videoEle.srcObject = null;

  if (backgroundImg.classList.contains('d-none')) {
    backgroundImg.classList.remove('d-none');
  }

  recorder.stop();
}

function downloandVideo() {
  const videoName = `video-${new Date().getTime()}`;
  const blob = new Blob(chunks);
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.style = 'display: none';
  link.href = blobUrl;
  link.download = `${videoName}.webm`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(blobUrl);
  chunks = [];

  btnStart.innerText = 'Start';

  if (recorder) {
    recorder.ondataavailable = undefined;
    recorder.onstop = undefined;
    recorder = undefined;
  }
}

function createPicInPic() {
  if (!videoEle.srcObject) {
    return;
  }
  videoEle.requestPictureInPicture();
}
