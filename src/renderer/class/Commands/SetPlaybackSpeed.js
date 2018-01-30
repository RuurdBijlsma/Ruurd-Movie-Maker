class SetPlaybackSpeed extends Command {
    constructor(fragment, newSpeed) {
        super();
        this.fragment = fragment;
        this.oldSpeed = fragment.playbackSpeed;
        this.newSpeed = newSpeed;
    }

    execute() {
        this.fragment.playbackSpeed = this.newSpeed;
    }

    undo() {
        this.fragment.playbackSpeed = this.oldSpeed;
    }
}