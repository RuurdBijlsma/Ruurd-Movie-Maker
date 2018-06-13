class MoveFragment extends Command {
    constructor(video, fragment, newIndex) {
        super();
        this.video = video;
        this.fragment = fragment;
        this.newIndex = Math.min(video.fragments.length - 1, Math.max(0, newIndex));
        this.oldIndex = video.fragments.indexOf(fragment);
    }

    execute() {
        this.video.moveFragment(this.fragment, this.newIndex);
    }

    undo() {
        this.video.moveFragment(this.fragment, this.oldIndex);
    }
}