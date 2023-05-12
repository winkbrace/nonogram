export default class Board {
    rows;
    cols;
    grid;
    rowHints;
    colHints;

    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.grid = new Array(rows).fill(new Array(cols).fill(0));
        this.rowHints = new Array(rows).fill([]);
        this.colHints = new Array(cols).fill([]);
    };
}
