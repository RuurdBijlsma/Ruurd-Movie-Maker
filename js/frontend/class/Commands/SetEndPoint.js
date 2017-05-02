class SetEndPoint extends Command {
    constructor(fragment, newPoint) {
        super();
        this.fragment = fragment;
        this.oldPoint = this.fragment.endPoint;
        this.newPoint = newPoint;
    }

    execute() {
        this.fragment.endPoint = this.newPoint;
    }

    undo() {
        this.fragment.endPoint = this.oldPoint;
    }
}