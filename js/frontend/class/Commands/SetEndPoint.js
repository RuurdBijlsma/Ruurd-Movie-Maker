class SetEndPoint extends Command {
    constructor(fragment, oldPoint, newPoint) {
        super();
        this.fragment = fragment;
        this.newPoint = newPoint;
        this.oldPoint = oldPoint;
    }

    execute() {
        this.fragment.endPoint = this.newPoint;
    }

    undo() {
        this.fragment.endPoint = this.oldPoint;
    }
}