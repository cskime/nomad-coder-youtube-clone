import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const files = {
  videoInput: "recording.webm",
  videoOutput: "output.mp4",
  thumbnailOutput: "thumbnail.jpg",
};

const downloadFile = (fileUrl, filename) => {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
};

const handleDownload = async () => {
  actionBtn.removeEventListener("click", handleDownload);
  actionBtn.innerText = "Transcoding...";
  actionBtn.disabled = true;

  const ffmpeg = new FFmpeg();

  await ffmpeg.load();
  await ffmpeg.writeFile(files.videoInput, await fetchFile(videoFile));
  await ffmpeg.exec(["-i", files.videoInput, "-r", "60", files.videoOutput]);
  await ffmpeg.exec([
    "-i",
    files.videoInput,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    files.thumbnailOutput,
  ]);

  const mp4File = await ffmpeg.readFile(files.videoOutput);
  const thumbnailFile = await ffmpeg.readFile(files.thumbnailOutput);

  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbnailBlob = new Blob([thumbnailFile.buffer], {
    type: "image/jpeg",
  });

  const mp4Url = URL.createObjectURL(mp4Blob);
  downloadFile(mp4Url, "MyRecording.mp4"); // mp4로 변환했으므로 확장자를 `mp4`로 명시

  const thumbnailUrl = URL.createObjectURL(thumbnailBlob);
  downloadFile(thumbnailUrl, "MyThumbnail.jpeg");

  await ffmpeg.deleteFile(files.videoInput);
  await ffmpeg.deleteFile(files.videoOutput);
  await ffmpeg.deleteFile(files.thumbnailOutput);

  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbnailUrl);
  URL.revokeObjectURL(videoFile);

  actionBtn.disabled = false;
  actionBtn.innerText = "Record Again";
  actionBtn.addEventListener("click", handleStart);
};

const handleStart = () => {
  actionBtn.innerText = "Recording";
  actionBtn.disabled = true;
  actionBtn.removeEventListener("click", handleStart);

  recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null; // preview로 사용하던 stream을 제거하고
    video.src = videoFile; // 저장된 video로 교체
    video.loop = true; // video 반복 재생
    video.play(); // 녹화한 video 실행
    actionBtn.innerText = "Download";
    actionBtn.disabled = false;
    actionBtn.addEventListener("click", handleDownload);
  };
  recorder.start();
  setTimeout(() => {
    recorder.stop();
  }, 5000);
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: 1024,
      height: 576,
    },
  });
  video.srcObject = stream;
  video.play();
};

init();

actionBtn.addEventListener("click", handleStart);
