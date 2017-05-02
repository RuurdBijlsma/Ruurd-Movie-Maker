class Command {
    constructor() {
        Command.undoStack.push(this);
    }

    static execute(command) {
        Command.undoStack.push(command);
        command.execute();
    }

    static undo() {
        Command.undoStack.undo();
    }

    static redo() {
        Command.undoStack.redo();
    }

    static get undoStack() {
        if (!Command._undoStack)
            Command._undoStack = new UndoStack();
        return Command._undoStack;
    }
}
