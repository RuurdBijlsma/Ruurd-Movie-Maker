const execFile = require("child_process").execFile;

exports.runFFMPEGCommand = commandArray => execFile("Resources/ffmpeg.exe", commandArray, () => {});
