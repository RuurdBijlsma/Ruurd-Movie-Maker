const {remote} = require('electron');
const {dialog} = require('electron').remote;
const node = remote.require("./ffmpeg.js");
const tmpDir = '.tmp';

document.addEventListener("DOMContentLoaded", initialize);
function initialize() {
    video = new Video({
        videoPlayer: document.getElementsByClassName('video-player')[0],
        videoContainer: document.getElementsByClassName('video-container')[0],
        thumbnailContainer: document.getElementsByClassName('thumbnails')[0],
        seekProgress: document.getElementsByClassName('seek-progress')[0],
        seekThumb: document.getElementsByClassName('seek-thumb')[0],
        timeStamp: document.getElementsByClassName('time-stamp')[0],
        playButton: document.getElementsByClassName('play-button')[0],
        frameRateElement: document.getElementsByClassName('frame-rate')[0],
        durationElement: document.getElementsByClassName('duration')[0],
        fragmentControls: document.getElementsByClassName('fragment-controls')[0],
        speedElement: document.getElementsByClassName('playback-speed')[0],
        volumeElement: document.getElementsByClassName('volume')[0],
        speedInput: document.getElementsByClassName('speed-input')[0],
        volumeInput: document.getElementsByClassName('volume-input')[0],
    });

    seeking = false;
    dividerChanging = false;

    seekBar = document.getElementsByClassName('seek-bar')[0];
    document.addEventListener('mousemove', e => {
        if (seeking)
            applySeekBar(e);
        if (dividerChanging)
            applyDividerChange(e);
    });
    document.addEventListener('mouseup', () => {
        seeking = false;
        dividerChanging = false;
    });
    document.addEventListener('keydown', e => {
        console.log(e.key);
        switch (e.key) {
            case "Escape":
                exitFullscreen();
                break;
            case "F11":
                toggleFullscreen();
                break;
            case " ":
                playPause();
                break;
            case "ArrowRight":
                nextFrame();
                break;
            case "ArrowLeft":
                previousFrame();
                break;
            case "Delete":
                deleteFragment();
                break;
        }
    });

    document.addEventListener('dragover', e => e.preventDefault(), false);
    document.addEventListener('drop', handleDrop, false);

    divider = document.getElementsByClassName("vertical-divider")[0];
    leftHalf = document.getElementsByClassName("left-half")[0];
    rightHalf = document.getElementsByClassName("right-half")[0];

    $('#exportModal').modal();
    $('select').material_select();
}

function deleteFragment() {
    video.removeFragment(video.activeFragment);
}

function setSpeed(e) {
    video.activeFragment.playbackSpeed = e.target.value;
}

function setVolume(e) {
    let value = e.target.value;
    video.activeFragment.volume = value / 100;
}

function applySeekBar(e) {
    let x = e.pageX - seekBar.offsetLeft;
    let width = seekBar.offsetWidth;

    x = x < 0 ? 0 : x;
    x = x > width ? width : x;

    video.currentTime = video.duration * x / width;
}

function startSeeking(e) {
    if (e.button === 0) {
        seeking = true;
        applySeekBar(e);
    }
}

function startDividerChange(e) {
    dividerChanging = true;
    applyDividerChange(e);
}

function applyDividerChange(e) {
    let minWidth = 500;
    if (e.pageX >= minWidth) {
        let x = e.pageX / window.innerWidth * 100;
        divider.style.left = `calc(${x}% - 10px)`;
        rightHalf.style.width = (100 - x) + '%';
        leftHalf.style.width = x + '%';
    }
}

function toggleFullscreen() {
    if (document.webkitIsFullScreen)
        exitFullscreen();
    else
        enterFullscreen();
}

function enterFullscreen() {
    let player = document.getElementsByClassName("video-player")[0];
    let controls = document.getElementsByClassName("video-controls")[0];
    let seekBar = document.getElementsByClassName("seek-bar")[0];

    controls.style.bottom = "10px";
    controls.style.top = "auto";
    controls.style.position = "fixed";
    controls.style.width = "100%";

    seekBar.style.bottom = "50px";
    seekBar.style.top = "auto";
    seekBar.style.position = "fixed";
    seekBar.style.width = "100%";

    player.webkitRequestFullscreen();
}

function exitFullscreen() {
    let controls = document.getElementsByClassName("video-controls")[0];
    let seekBar = document.getElementsByClassName("seek-bar")[0];

    controls.style.bottom = "auto";
    controls.style.top = "6px";
    controls.style.position = "relative";
    controls.style.width = "auto";

    seekBar.style.bottom = "auto";
    seekBar.style.top = "2px";
    seekBar.style.position = "relative";
    seekBar.style.width = "auto";

    document.webkitExitFullscreen()
}

function nextFrame() {
    video.nextFrame();
}

function previousFrame() {
    video.previousFrame();
}

function playPause() {
    if (video.playing) {
        video.pause();
    }
    else {
        video.play();
    }
}

function handleDrop(e) {
    e.preventDefault();
    video.addFragments(e.dataTransfer.files);
}

function addVideo(e) {
    video.addFragments(e.target.files);
}

function exportVideo() {
    let window = remote.getCurrentWindow();
    if (video.fragments.length <= 0) {
        dialog.showMessageBox(window,
            {
                type: 'warning',
                buttons: ['¯\\_(ツ)_/¯'],
                title: 'Warning',
                message: 'There are no videos to export',
                detail: 'Add videos before exporting'
            });
        return;
    }
    let frameRate = document.getElementById('frame-rate').value;
    let format = document.getElementById('format-selector').value;
    let config = new ExportConfig({
        fps: frameRate,
        format: format
    });

    disableMouse();
    dialog.showSaveDialog(window,
        {
            title: "Export video",
            buttonLabel: "Export",
            defaultPath: getFileName(format),
            filters: [
                {
                    name: `Video/${format}`,
                    extensions: [`${format}`]
                },
                {
                    name: `All files/*`,
                    extensions: ['*']
                }
            ],
        }, path => {
            if (path === undefined) {
                enableMouse();
                return;
            }
            console.log(path);
            video.export({
                config: config,
                outputFile: path,
                overwrite: true,
                onProgress: p => {
                    console.log(p);
                    window.setProgressBar(p);
                }
            }).then(d => {
                window.setProgressBar(0);
                console.log('Done!', d);
                enableMouse();
            });
        });
}

function getFileName(format = 'mp4') {
    format = '.' + format;
    let commonName = sharedStart(video.fragments.map(f => f.file.name)).trim();

    console.log('initialname:', commonName);

    if (commonName.includes(format)) {
        console.log(format + ' is included');
        commonName = commonName.substring(0, commonName.length - format.length);
    }

    return `${commonName.length === 0 ? 'video' : commonName}${format}`;
}

function disableMouse() {
    document.body.style.pointerEvents = "none";
}
function enableMouse() {
    document.body.style.pointerEvents = "all";
}
function sharedStart(array) {
    let A = array.concat().sort(),
        a1 = A[0], a2 = A[A.length - 1], L = a1.length, i = 0;
    while (i < L && a1.charAt(i) === a2.charAt(i)) i++;
    return a1.substring(0, i);
}