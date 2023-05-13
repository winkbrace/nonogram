export default class Line {
    constructor(id, cells) {
        this.id = id;
        this.cells = cells;
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
}
