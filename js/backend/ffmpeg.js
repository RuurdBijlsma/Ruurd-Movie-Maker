const execFile = require("child_process").execFile;

exports.runFFMPEGCommand = (commandArray, done) => execFile("Resources/ffmpeg.exe", commandArray, done);
