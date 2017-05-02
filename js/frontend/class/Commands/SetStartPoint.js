class SetStartPoint extends Command {
    constructor(fragment, oldPoint, newPoint) {
        super();
        this.fragment = fragment;
        this.newPoint = newPoint;
        this.oldPoint = oldPoint;
    }

    execute() {
        this.fragment.startPoint = this.newPoint;
    }

    undo() {
        this.fragment.startPoint = this.oldPoint;
    }
}