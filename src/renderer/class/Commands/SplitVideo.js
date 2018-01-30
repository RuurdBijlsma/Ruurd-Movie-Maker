class SplitVideo extends Command {
    constructor(video, fragment, splitPoint) {
        super();
        this.video = video;
        this.fragment = fragment;
        this.splitPoint = splitPoint;
    }

    execute() {
        this.oldEndPoint = this.fragment.endPoint;
        this.newFragment = this.video.split(this.fragment, this.splitPoint);
    }

    undo() {
        this.video.removeFragment(this.newFragment);
        this.fragment.endPoint = this.oldEndPoint;
    }
}