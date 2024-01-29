const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const volumeRange = document.getElementById("volume");
const timelineRange = document.getElementById("timeline");

let volume = volumeRange.value;
video.volume = volume;

const handlePlayClick = (event) => {
  video.paused ? video.play() : video.pause();
  playBtn.innerText = video.paused ? "Play" : "Pause";
};

const handleMute = (event) => {
  muteBtn.innerText = video.muted ? "Mute" : "Unmute";
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

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeInput);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
timelineRange.addEventListener("change", handleTimelineChange);
