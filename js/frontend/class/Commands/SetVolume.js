class SetVolume extends Command {
    constructor(fragment, newVolume, oldVolume) {
        super();
        this.fragment = fragment;
        this.newVolume = newVolume;
        this.oldVolume = oldVolume;
    }

    execute() {
        this.fragment.volume = this.newVolume;
    }

    undo() {
        this.fragment.volume = this.oldVolume;
    }
}