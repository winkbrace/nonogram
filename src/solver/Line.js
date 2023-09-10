export default class Line {
    constructor(id, cells, hints) {
        this.id = id;
        this.cells = cells;
        this.hints = hints;
    }

    isSolved() {
        return this.cells.every(cell => cell.isFilled() || cell.isEmpty());
    }

    markAllUnknownAsEmpty() {
        this.cells.forEach(cell => {
            if (cell.isUnknown()) {
                cell.markEmpty();
            }
        });
    }

    get length() {
        return this.cells.length;
    }

    get firstHint() {
        return this.hints[0];
    }

    get lastHint() {
        return this.hints[this.hints.length - 1];
    }

    get firstCell() {
        return this.cells[0];
    }

    get lastCell() {
        return this.cells[this.cells.length - 1];
    }
}
