const audio = document.querySelector("#audio");
const fileInput = document.querySelector("#audio-file");
const playButton = document.querySelector("#play-button");
const playIcon = playButton.querySelector(".play-icon");
const trackName = document.querySelector("#track-name");
const playerStatus = document.querySelector("#player-status");
const seek = document.querySelector("#seek");
const volume = document.querySelector("#volume");
const currentTime = document.querySelector("#current-time");
const duration = document.querySelector("#duration");

let objectUrl = null;
let isSeeking = false;

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainder}`;
}

function setPlayerStatus(message) {
    playerStatus.textContent = message;
}

function loadAudioFile(file) {
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
        setPlayerStatus("這個檔案不是可播放的音訊格式，請重新選擇。");
        return;
    }

    audio.pause();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    audio.src = objectUrl;
    audio.load();
    trackName.textContent = file.name.replace(/\.[^.]+$/, "");
    setPlayerStatus("音檔已就緒，按下播放開始試聽");
    playIcon.textContent = "▶";
    playButton.setAttribute("aria-label", "播放");
    seek.value = "0";
    currentTime.textContent = "0:00";
    duration.textContent = "0:00";
    fileInput.value = "";
}

fileInput.addEventListener("change", () => loadAudioFile(fileInput.files[0]));

playButton.addEventListener("click", async () => {
    if (!audio.src) {
        fileInput.click();
        return;
    }

    if (audio.paused) {
        try {
            await audio.play();
        } catch (error) {
            setPlayerStatus("無法播放此音檔，請選擇另一個音訊檔案。");
            console.error("Audio playback failed:", error);
        }
    } else {
        audio.pause();
    }
});

audio.addEventListener("loadedmetadata", () => {
    duration.textContent = formatTime(audio.duration);
    seek.max = String(audio.duration);
    setPlayerStatus("音檔已就緒，按下播放開始試聽");
});

audio.addEventListener("timeupdate", () => {
    if (!isSeeking) seek.value = String(audio.currentTime);
    currentTime.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("play", () => {
    playIcon.textContent = "Ⅱ";
    playButton.setAttribute("aria-label", "暫停");
    setPlayerStatus("正在播放");
});

audio.addEventListener("pause", () => {
    playIcon.textContent = "▶";
    playButton.setAttribute("aria-label", "播放");
    if (audio.currentTime > 0 && !audio.ended) setPlayerStatus("已暫停");
});

audio.addEventListener("ended", () => {
    setPlayerStatus("播放結束，再聽一次？");
});

audio.addEventListener("error", () => {
    if (audio.src) setPlayerStatus("無法讀取此音檔，請確認格式後重新選擇。");
});

seek.addEventListener("input", () => {
    isSeeking = true;
    currentTime.textContent = formatTime(Number(seek.value));
});

seek.addEventListener("change", () => {
    audio.currentTime = Number(seek.value);
    isSeeking = false;
});

volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
});

audio.volume = Number(volume.value);