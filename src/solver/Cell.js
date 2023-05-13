export default class Cell {
    static UNKNOWN = -1;
    static EMPTY = 0;
    static FILLED = 1;

    constructor(r, c) {
        this.state = Cell.UNKNOWN;
        this.r = r;
        this.c = c;
    }

    isUnknown() {
        return this.state === Cell.UNKNOWN;
    }

    isEmpty() {
        return this.state === Cell.EMPTY;
    }

    isFilled() {
        return this.state === Cell.FILLED;
    }

    markEmpty() {
        this.state = Cell.EMPTY;
    }

    markFilled() {
        this.state = Cell.FILLED;
    }

    get color() {
        if (this.isEmpty()) {
            return "white";
        } else if (this.isFilled()) {
            return "black";
        }
        return "#ddd";
    }
}
