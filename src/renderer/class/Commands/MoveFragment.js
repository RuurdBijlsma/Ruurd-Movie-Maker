class MoveFragment extends Command {
    constructor(video, fragment, newIndex) {
        super();
        this.video = video;
        this.fragment = fragment;
        this.newIndex = newIndex;
        this.oldIndex = video.fragments.indexOf(fragment);
    }

    execute() {
        this.video.moveFragment(this.fragment, this.newIndex);
    }

    undo() {
        this.video.moveFragment(this.fragment, this.oldIndex);
    }
}