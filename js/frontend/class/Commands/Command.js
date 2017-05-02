class Command {
    constructor() {
        Command.undoStack.push(this);
    }

    static get undoStack() {
        if (!Command._undoStack)
            Command._undoStack = new UndoStack();
        return Command._undoStack;
    }
}
