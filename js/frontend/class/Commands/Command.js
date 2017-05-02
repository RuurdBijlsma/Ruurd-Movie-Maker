class Command {
    constructor() {
        Command.undoStack.push(this);
    }

    static undoStack = new UndoStack();
}
