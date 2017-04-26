class FFMPEG {
    constructor() {
        this.reset();
    }

    //------------------------Commands------------------------//
    get input() {
        return this.commands['input'].command;
    }

    set input(value) {
        this.commands['input'] = new FFMPEGCommand('-i ' + value, 2);
    }

    get output() {
        return this.commands['output'].command;
    }

    set output(value) {
        this.commands['output'] = new FFMPEGCommand(value, 5);
    }

    get startTime() {
        return this.commands['startTime'].command;
    }

    set startTime(value) {
        this.commands['startTime'] = new FFMPEGCommand('-ss ' + value, 0);
    }

    get duration() {
        return this.commands['duration'].command;
    }

    set duration(value) {
        this.commands['duration'] = new FFMPEGCommand('-t ' + value, 3);
    }

    get frameRate() {
        return this.commands['frameRate'].command;
    }

    set frameRate(value) {
        this.commands['frameRate'] = new FFMPEGCommand('-r ' + value, 3);
    }

    //------------------------Filters------------------------//
    get filter() {
        let array = [];
        for (let key in this.filters) {
            let value = this.filters[key];
            array.push(value);
        }

        return `-filter:v "${array.join(",")}"`;
    }

    get playbackSpeed() {
        return this.filters['playbackSpeed'];
    }

    set playbackSpeed(value) {
        this.filters['playbackSpeed'] = `setpts=${1 / value}*PTS`;
    }

    get command() {
        let array = [];
        for (let key in this.commands) {
            let value = this.commands[key];
            array.push(value);
        }

        array.push(new FFMPEGCommand(this.filter, 4));

        return array.sort((a, b) => a.priority - b.priority).map(c => c.command).join(" ");
    }

    run() {
        return runFfmpegCommand(this.command);
    }

    reset() {
        this.commands = {};
        this.filters = {};
        this.input = "";
        this.output = "output.mp4";
        this.startTime = 0;
        this.frameRate = 60;
        this.playbackSpeed = 1;
    }
}