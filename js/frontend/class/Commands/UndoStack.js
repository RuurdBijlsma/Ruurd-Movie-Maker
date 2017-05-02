class UndoStack extends Array {
    constructor() {
        super();
        this.index = 0;
    }

    push(command) {
        console.log("Command added to stack:", command);
        this.splice(this.index++);
        super.push(command);

        // this.splice(this.index++, 0, command);
    }

    undo() {
        if (this.index > 0)
            this[--this.index].undo();
    }

    redo() {
        if (this.index < this.length)
            this[this.index++].execute();
    }

    toString() {
        let result = '';
        for (let i = 0; i < this.length; i++) {
            result += this[i].constructor.name;
            if (i === this.index) {
                result += '<--- ACTIVE';
            }
            result += '\n';
        }
        return result;
    }
}
