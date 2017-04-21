const {ipcRenderer, remote} = require('electron');
const runFFMPEGCommand = remote.require("./ffmpeg.js").runFFMPEGCommand;

function selectVideo(e) {
    console.log(e);
    let files = e.target.files;

    for (file of files) {
        console.log(file);
        video.src = file.path;
    }

    runFFMPEGCommand(['-version']).then(stdout => {
        //console.log(stdout);
    });
}