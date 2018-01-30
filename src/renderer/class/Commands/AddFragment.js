class AddFragment extends Command {
    constructor(video, fragment) {
        super();
        this.video = video;
        this.fragment = fragment;
    }

    execute() {
        this.video.addFragment(this.fragment);
    }

    undo() {
        this.video.removeFragment(this.fragment);
    }
}