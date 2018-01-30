class SetStartPoint extends Command {
    constructor(fragment, newPoint) {
        super();
        this.fragment = fragment;
        this.oldPoint = this.fragment.startPoint;
        this.newPoint = newPoint;
    }

    execute() {
        this.fragment.startPoint = this.newPoint;
    }

    undo() {
        this.fragment.startPoint = this.oldPoint;
    }
}