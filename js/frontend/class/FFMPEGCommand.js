class FFMPEGCommand {
    get command() {
        return this._command;
    };

    set command(value) {
        this._command = value;
    }

    get priority() {
        return this._priority;
    };

    set priority(value) {
        this._priority = value;
    }

    constructor(command, priority) {
        this.command = command;
        this.priority = priority;
    }
}