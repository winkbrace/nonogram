/**
 * Helper class to keep track of hints details for Canvas.
 */
export default class Hints {
    constructor(cellSize, rows, cols) {
        this.cellSize = cellSize;
        this.setRows(rows);
        this.setCols(cols);
    }

    adjust(board) {
        this.setRows(board.getMaxRowHintCount());
        this.setCols(board.getMaxColHintCount());

        return this;
    }

    setRows(rows) {
        // Always draw at least 5 cells for the hints area.
        this.rows = Math.max(rows, 5);
    }

    setCols(cols) {
        // Always draw at least 5 cells for the hints area.
        this.cols = Math.max(cols, 5);
    }

    get width() {
        return this.cellSize * this.rows;
    }

    get height() {
        return this.cellSize * this.cols;
    }
}
