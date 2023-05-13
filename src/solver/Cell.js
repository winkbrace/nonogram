export default class Cell {
    static UNKNOWN = -1;
    static EMPTY = 0;
    static FILLED = 1;

    constructor(r, c) {
        this.state = Cell.UNKNOWN;
        this.r = r;
        this.c = c;
    }
}
