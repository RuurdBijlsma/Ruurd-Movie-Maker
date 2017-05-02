class DeleteFragment extends Command {
    constructor(video, fragment) {
        super();
        this.video = video;
        this.fragment = fragment;
        this.index = video.fragments.indexOf(fragment);
    }

    execute() {
        this.video.removeFragment(this.fragment);
    }

    undo() {
        this.video.addFragment(this.fragment, this.index);
    }
}