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

        return new FFMPEGCommand(4, '-filter:v', `"${array.join(",")}"`)
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
    }, stdinFun = () => {
    }, stderrFun = () => {
    }) {
        console.info("Running command: ", commandArray);
        let process = runFFMPEGCommand(commandArray);
        let stdout = '';
        let stdin = '';
        let stderr = '';

        process.stdout.on('data', function (buf) {
            stdout += buf;
            stdoutFun(buf);
        });

        process.stdin.on('data', function (buf) {
            stdin += buf;
            stdinFun(buf);
        });

        process.stderr.on('data', function (buf) {
            stderr += buf;
            stderrFun(buf);
        });

        return new Promise(resolve => {
            process.on('close', function (code) {
                resolve({
                    stdout: stdout,
                    stdin: stdin,
                    stderr: stderr,
                    code: code
                });
            });
        });
    }

    run() {
        return FFMPEG.runCommand(this.commandArray);
    }

    reset() {
        this.commands = {};
        this.filters = {};
        this.input = "";
        this.output = "output.mp4";
        this.startTime = 0;
    }
}