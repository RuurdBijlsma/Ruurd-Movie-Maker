class Command {
    constructor() {
        Command.undoStack.push(this);
    }

    static undo() {
        Command.undoStack.undo();

        console.log(Command.undoStack.toString());
    }

    static redo() {
        Command.undoStack.redo();

        console.log(Command.undoStack.toString());
    }

    static get undoStack() {
        if (!Command._undoStack)
            Command._undoStack = new UndoStack();
        return Command._undoStack;
    }
}
