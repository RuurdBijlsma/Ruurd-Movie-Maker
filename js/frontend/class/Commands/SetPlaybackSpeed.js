class SetPlaybackSpeed extends Command {
    constructor(fragment, newSpeed, oldSpeed) {
        super();
        this.fragment = fragment;
        this.newSpeed = newSpeed;
        this.oldSpeed = oldSpeed;
    }

    execute() {
        this.fragment.playbackSpeed = this.newSpeed;
    }

    undo() {
        this.fragment.playbackSpeed = this.oldSpeed;
    }
}