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

    constructor(priority, ...command) {
        this.priority = priority;
        this.command = command.map(c => c.toString());
    }
}