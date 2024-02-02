const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const volumeRange = document.getElementById("volume");
const timelineRange = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenBtnIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volume = volumeRange.value;
video.volume = volume;

/* Video */

const handleVideoPlay = () => {
  video.paused ? video.play() : video.pause();
  playBtnIcon.className = video.paused ? "fa fa-play" : "fa fa-pause";
};

const handleMute = (event) => {
  muteBtnIcon.className = video.muted
    ? "fas fa-volume-up"
    : "fas fa-volume-mute";
  video.muted = !video.muted;
  volumeRange.value = video.muted ? 0 : volume;
};

const handleVolumeInput = (event) => {
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  }
  volume = event.target.value;
  video.volume = volume;
};

const formatTime = (seconds) =>
  new Date(seconds * 1000).toISOString().substring(14, 19);

const handleLoadedMetadata = () => {
  const duration = Math.floor(video.duration);
  totalTime.innerText = formatTime(duration);
  timelineRange.max = duration;
};

const handleTimeUpdate = () => {
  const time = Math.floor(video.currentTime);
  currentTime.innerText = formatTime(time);
  timelineRange.value = time;
};

const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

const handleFullScreen = () => {
  if (document.fullscreenElement) {
    fullScreenBtnIcon.className = "fas fa-expand";
    document.exitFullscreen();
  } else {
    fullScreenBtnIcon.className = "fas fa-compress";
    videoContainer.requestFullscreen();
  }
};

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  videoControls.classList.add("showing");
  controlsMovementTimeout = setTimeout(hideControls, 3000);
};

const handleMouseLeave = () => {
  controlsTimeout = setTimeout(hideControls, 3000);
};

const handleSpacebarEvent = (event) => {
  const isSpacebarEvent =
    event.key === " " || event.code === "Space" || event.keyCode === 32;

  if (!isSpacebarEvent) {
    return;
  }

  handleVideoPlay();
};

const handleEnded = () => {
  // Backend에서 video id를 Frontend로 전달하기 위해
  // `#videoContainer` element에 `data-videoId`로 video id 값을 저장해 둠
  // Frontend에서는 `videoContainer.dataset.videoId`로 접근해서 값을 사용할 수 있음
  const { videoId } = videoContainer.dataset;
  fetch(`/api/videos/${videoId}/view`, { method: "POST" });
};

playBtn.addEventListener("click", handleVideoPlay);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeInput);
video.addEventListener("click", handleVideoPlay);
video.addEventListener("loadeddata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
timelineRange.addEventListener("change", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullScreen);
document.addEventListener("keyup", handleSpacebarEvent);
