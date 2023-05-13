import Cell from "./Cell";
import Line from "./Line";

export default class Board {
    rows;
    cols;
    grid = [];
    rowHints;
    colHints;
    inputString = "";
    listeners = {
        inputChange: [],
        nextStep: [],
    };

    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;

        this.init(rows, cols);
    };

    init(rows, cols) {
        this.rowHints = new Array(rows).fill([]);
        this.colHints = new Array(cols).fill([]);

        for (let r = 0; r < rows; r++) {
            this.grid[r] = new Array(cols).fill(0);
            for (let c = 0; c < cols; c++) {
                this.grid[r][c] = new Cell(r, c);
            }
        }
    }

    getAllCells() {
        return this.grid.flat();
    }

    getRow(r) {
        return new Line(`row ${r}`, this.grid[r]);
    }

    getCol(c) {
        return new Line(`col ${c}`, this.grid.map(row => row[c]));
    }

    addRowHints(r, hints) {
        this.rowHints[r] = hints;
        this.refreshInputString();
    }

    addColHints(c, hints) {
        this.colHints[c] = hints;
        this.refreshInputString();
    }

    getMaxRowHintSize() {
        return Math.max(...this.rowHints.map(hints => hints.length));
    }

    getMaxColHintSize() {
        return Math.max(...this.colHints.map(hints => hints.length));
    }

    refreshInputString() {
        this.inputString = "c["
            + this.colHints.map(hints => hints.join(" ")).join(",")
            + "]r["
            + this.rowHints.map(hints => hints.join(" ")).join(",")
            + "]";

        console.log("The input string is: ", this.inputString);

        this.inputChanged();
    }

    getHintsAtPos(r, c) {
        if (r >= 0) {
            return this.rowHints[r] ?? []
        }

        return this.colHints[c] ?? [];
    }

    // add listener
    onInputChange(f) {
        this.listeners.inputChange.push(f);
    }

    onNextStep(f) {
        this.listeners.nextStep.push(f);
    }

    // run listeners
    inputChanged() {
        this.listeners.inputChange.forEach(f => f(this.inputString));
    }

    step(step) {
        this.listeners.nextStep.forEach(f => f(step));
    }

    parse(input) {
        // We could add more checks, but let's just allow the app to crash.
        if (! input) {
            return;
        }

        this.inputString = input;
        const cols = input.match(/c\[[\d,\s]+\]/)[0].substring(2).replace("]", "").split(",");
        const rows = input.match(/r\[[\d,\s]+\]/)[0].substring(2).replace("]", "").split(",");

        this.colHints = cols.map(hints => hints.split(" ").map(Number));
        this.rowHints = rows.map(hints => hints.split(" ").map(Number));

        this.inputChanged();
    }

    clear() {
        this.init(this.rows, this.cols);
        this.inputChanged();
    }
}
