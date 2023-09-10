export default class Hint {
    constructor(nr, solved = false) {
        this.nr = nr;
        this.solved = solved;
        this.cells = null;
    }

    markSolved(subLine) {
        this.solved = true;
        this.cells = subLine.cells.filter(cell => cell.isFilled());
    }

    get isSolved() {
        return this.solved;
    }

    get firstCell() {
        return this.cells[0];
    }

    get lastCell() {
        return this.cells[this.cells.length - 1];
    }
}
