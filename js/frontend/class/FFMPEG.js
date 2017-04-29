class FFMPEG {
    constructor() {
        this.reset();
    }

    //------------------------Commands------------------------//
    get overwrite() {
        return this.commands['overwrite'].command;
    }

    set overwrite(value) {
        if (!value)
            delete this.commands['overwrite'];
        else
            this.commands['overwrite'] = new FFMPEGCommand(0, '-y');
    }

    get input() {
        return this.commands['input'].command;
    }

    set input(value) {
        this.commands['input'] = new FFMPEGCommand(2, '-i', value);
    }

    get output() {
        return this.commands['output'].command;
    }

    set output(value) {
        this.commands['output'] = new FFMPEGCommand(5, value);
    }

    get startTime() {
        return this.commands['startTime'].command;
    }

    set startTime(value) {
        this.commands['startTime'] = new FFMPEGCommand(0, '-ss', value);
    }

    get duration() {
        return this.commands['duration'].command;
    }

    set duration(value) {
        this.commands['duration'] = new FFMPEGCommand(3, '-t', value);
    }

    get frameRate() {
        return this.commands['frameRate'].command;
    }

    set frameRate(value) {
        this.commands['frameRate'] = new FFMPEGCommand(3, '-r', value);
    }

    //------------------------Filters------------------------//
    get filter() {
        let array = [];
        for (let key in this.filters) {
            let value = this.filters[key];
            array.push(value);
        }

        return new FFMPEGCommand(4, '-filter:v', `${array.join(",")}`)
    }

    get playbackSpeed() {
        return this.filters['playbackSpeed'];
    }

    set playbackSpeed(value) {
        this.filters['playbackSpeed'] = `setpts=${1 / value}*PTS`;
    }

    get commandArray() {
        let array = [];
        for (let key in this.commands) {
            let value = this.commands[key];
            array.push(value);
        }

        if (Object.keys(this.filters).length > 0)
            array.push(this.filter);

        let arrays = array.sort((a, b) => a.priority - b.priority).map(c => c.command);
        return [].concat.apply([], arrays);
    }

    static runCommand(commandArray, stdoutFun = () => {
    }) {
        console.info("Running command: ", commandArray);

        return new Promise(resolve => {
            let process = node.runFFMPEGCommand(commandArray, (error, stdout, stderr) => {
                resolve({
                    error: error,
                    stdout: stdout,
                    stderr: stderr
                });
            });

            process.stdout.on('data', buf => {
                console.warn('[REAL STDOUT]', buf);
            });

            process.stdin.on('data', buf => {
                console.warn('[STDIN]', buf);
            });

            process.stderr.on('data', buf => {
                stdoutFun(buf);
            });
        });
    }

    run(process = () => {
    }) {
        return FFMPEG.runCommand(this.commandArray, stdout => {
            let info = FFMPEG.getFrameInfo(stdout);
            if (info) process(info);
        });
    }

    static getFrameInfo(string) {
        if (string.includes('frame') && string.includes('fps') && string.includes('q') && string.includes('size') && string.includes('time')) {
            let frame, fps, quality, size, hms;

            frame = string.split('frame=')[1].split('fps')[0].trim();
            fps = string.split('fps=')[1].split('q')[0].trim();
            quality = string.split('q=')[1].split('size')[0].trim();
            size = string.split('size=')[1].split('time')[0].trim();
            hms = string.split('time=')[1].split('bitrate')[0].trim();

            return {
                frame: frame,
                fps: fps,
                quality: quality,
                size: size,
                time: Video.hmsToSeconds(hms)
            };
        }
        return null;
    }

    static concatFiles(files, outputFile, overwrite = true) {
        let content = files.map(f => "file '" + f + "'").join('\n');
        let listName = 'files.txt';
        console.log('files.txt:', content);
        node.createFile(tmpDir + '/' + listName, content);

        let commandArray = ['-f', 'concat', '-safe', 0, '-i', tmpDir + '/' + listName, '-c', 'copy', outputFile];
        if (overwrite)
            commandArray.unshift('-y');

        return FFMPEG.runCommand(commandArray).then(d => {
            node.deleteFile(tmpDir + '/files.txt');
        });
    }

    reset() {
        this.commands = {};
        this.filters = {};
        this.input = "";
        this.output = "output.mp4";
        this.startTime = 0;
    }
}