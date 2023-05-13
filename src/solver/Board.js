export default class Board {
    rows;
    cols;
    grid;
    rowHints;
    colHints;
    inputString = "";
    listeners = {
        inputChange: [],
    };

    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.grid = new Array(rows).fill(new Array(cols).fill(0));
        this.rowHints = new Array(rows).fill([]);
        this.colHints = new Array(cols).fill([]);
    };

    addRowHints(r, hints) {
        this.rowHints[r] = hints;
        this.refreshInputString();
    }

    addColHints(c, hints) {
        this.colHints[c] = hints;
        this.refreshInputString();
    }

    refreshInputString() {
        this.inputString = "c["
            + this.colHints.map(hints => hints.join(" ")).join(",")
            + "]r["
            + this.rowHints.map(hints => hints.join(" ")).join(",")
            + "]";

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

    // run listeners
    inputChanged() {
        this.listeners.inputChange.forEach(f => f(this.inputString));
    }

    solve() {

    }

    clear() {

    }
}
