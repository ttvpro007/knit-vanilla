// Select elements
const media = document.querySelector("video");
const controls = document.querySelector(".controls");

const playBtn = document.querySelector(".play");
const stopBtn = document.querySelector(".stop");
const rwdBtn = document.querySelector(".rwd");
const fwdBtn = document.querySelector(".fwd");

const timerWrapper = document.querySelector(".timer");
const timer = document.querySelector(".timer span");
const timerBar = document.querySelector(".timer div");

let intervalFwd, intervalRwd;

// Initialize controls
function init() {
    media.removeAttribute("controls");
    controls.style.visibility = "visible";

    playBtn.addEventListener("click", togglePlayPause);
    stopBtn.addEventListener("click", stopMedia);
    media.addEventListener("ended", stopMedia);
    rwdBtn.addEventListener("click", () => handleRewind(rwdBtn, windBackward));
    fwdBtn.addEventListener("click", () => handleRewind(fwdBtn, windForward));
    media.addEventListener("timeupdate", updateTime);
}

function togglePlayPause() {
    resetRewind();

    if (media.paused) {
        playBtn.setAttribute("data-icon", "u");
        media.play();
    } else {
        playBtn.setAttribute("data-icon", "P");
        media.pause();
    }
}

function stopMedia() {
    media.pause();
    media.currentTime = 0;
    playBtn.setAttribute("data-icon", "P");
    resetRewind();
}

function handleRewind(button, rewindFunction) {
    resetRewind();

    if (button.classList.contains("active")) {
        button.classList.remove("active");
        media.play();
    } else {
        button.classList.add("active");
        media.pause();
        if (button === rwdBtn) {
            intervalRwd = setInterval(rewindFunction, 200);
        } else {
            intervalFwd = setInterval(rewindFunction, 200);
        }
    }
}

function windBackward() {
    if (media.currentTime <= 3) {
        stopMedia();
    } else {
        media.currentTime -= 3;
    }
}

function windForward() {
    if (media.currentTime >= media.duration - 3) {
        stopMedia();
    } else {
        media.currentTime += 3;
    }
}

function resetRewind() {
    clearInterval(intervalRwd);
    clearInterval(intervalFwd);
    rwdBtn.classList.remove("active");
    fwdBtn.classList.remove("active");
}

function updateTime() {
    const minutes = Math.floor(media.currentTime / 60).toString().padStart(2, "0");
    const seconds = Math.floor(media.currentTime % 60).toString().padStart(2, "0");

    timer.textContent = `${minutes}:${seconds}`;
    timerBar.style.width = `${(timerWrapper.clientWidth * media.currentTime) / media.duration}px`;
}

// Initialize the media player
init();
