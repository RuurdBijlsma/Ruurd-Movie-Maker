const execFile = require("child_process").execFile;

exports.runFFMPEGCommand = commandArray => {
    return new Promise(resolve => {
        execFile("Resources/ffmpeg.exe", commandArray, (err, stdout, stdin) => {
            resolve(stdout);
        });
    });
};