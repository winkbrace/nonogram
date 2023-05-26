import Cell from "./Cell";
import Line from "./Line";

export default class Board {
    rows;
    cols;
    grid = [];

    // The solved cells are updated in the grid, but we keep track of which cells
    // we have shown here for when we step through the solution one step at a time.
    // I couldn't make this work in the Canvas component.
    shownCells = [];

    rowHints;
    colHints;
    inputString = "";
    listeners = {
        inputChange: [],
        nextStep: [],
    };

    static empty() {
        const emptyHints = new Array(20).join(',');
        const input = "c[" + emptyHints + "]r[" + emptyHints + "]";

        return this.fromInput(input);
    };

    static fromInput(input) {
        const board = new Board();
        board.parse(input);

        return board;
    }

    createGrid() {
        const { rows, cols } = this;

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
        return new Line(`row ${r}`, this.grid[r], this.rowHints[r]);
    }

    getCol(c) {
        return new Line(`column ${c}`, this.grid.map(row => row[c]), this.colHints[c]);
    }

    addShownCell(r, c) {
        this.shownCells.push(this.grid[r][c]);
    }

    addRowHints(r, hints) {
        this.rowHints[r] = hints;
        this.refreshInputString();
    }

    addColHints(c, hints) {
        this.colHints[c] = hints;
        this.refreshInputString();
    }

    getMaxRowHintCount() {
        if (! this.maxRowHintsCount) {
            this.maxRowHintsCount = Math.max(...this.rowHints.map(hints => hints.length));
        }
        return this.maxRowHintsCount;
    }

    getMaxColHintCount() {
        if (! this.maxColHintsCount) {
            this.maxColHintsCount = Math.max(...this.colHints.map(hints => hints.length));
        }
        return this.maxColHintsCount;
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
        // We could add more checks, but let's just allow the app to crash on invalid input.
        if (! input) {
            return;
        }

        this.inputString = input;
        const cols = input.match(/c\[[\d,\s]+]/)[0].substring(2).replace("]", "").split(",");
        const rows = input.match(/r\[[\d,\s]+]/)[0].substring(2).replace("]", "").split(",");

        this.cols = cols.length;
        this.rows = rows.length;
        this.colHints = cols.map(hints => hints.split(" ").map(Number).map(n => n > 0 ? n : ""));
        this.rowHints = rows.map(hints => hints.split(" ").map(Number).map(n => n > 0 ? n : ""));

        this.createGrid();

        this.inputChanged();
    }

    clear() {
        this.createGrid(this.rows, this.cols);
        this.inputChanged();
    }
}
