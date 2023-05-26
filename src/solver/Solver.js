import Step from "./Step";
import Line from "./Line";

export default class Solver {
    somethingChanged = true;

    constructor(board) {
        this.board = board;
        this.steps = [];
        this.isSolved = false;
    }

    step() {
        if (! this.isSolved) {
            this.solve();
        }
        console.log("steps", this.steps);

        if (this.steps.length === 0) {
            this.board.step(new Step(null, 0, null, "done"));
            return;
        }

        this.board.step(this.steps.shift());
    }

    solve() {
        while (this.somethingChanged) {
            this.somethingChanged = false;

            this.board.rowHints.forEach((hints, r) => {
                this.solveLine(this.board.getRow(r));
            });

            this.board.colHints.forEach((hints, c) => {
                this.solveLine(this.board.getCol(c));
            });
        }

        this.isSolved = true;
    }

    solveLine(line) {
        if (line.isSolved()) return;

        this.noHintsRule(line);
        this.countFromBothSidesRule(line);
        this.drawFromTheEdgeRule(line);
        this.fillBeforeFirstEmptyFromEdge(line);
    }

    addStep(step) {
        this.steps.push(step);
        this.somethingChanged = true;
    }

    /**
     * No hints means that all cells are empty.
     */
    noHintsRule(line) {
        if (! line.hints.length) {
            line.markAllUnknownAsEmpty();
            this.addStep(new Step(line, 0, line.cells, "noHints"));
        }
    }

    /**
     * If we count from the edge on both sides of the line and hints have overlapping cells, we can mark the cells as filled.
     */
    countFromBothSidesRule(line) {
        const hints = line.hints;
        const start = [];
        const end = [];

        let counter = 0;
        for (let h=0; h<hints.length; h++) {
            start[h] = [];
            for (let i=0; i < hints[h].nr; i++) {
                start[h].push(counter++);
            }
            counter++; // the space between
        }

        counter = line.length - 1;
        for (let h=hints.length-1; h>=0; h--) {
            end[h] = [];
            for (let i=0; i < hints[h].nr; i++) {
                end[h].push(counter--);
            }
            counter--; // the space between
        }

        for (let h=0; h<hints.length; h++) {
            const overlap = start[h].filter(cell => end[h].includes(cell));
            const cells = overlap.map(i => line.cells[i]);
            if (! cells.length) continue;

            // It is not a new discovery if all cells are already filled.
            const unknown = cells.filter(cell => cell.isUnknown());
            if (unknown.length === 0) continue;

            cells.forEach(cell => cell.markFilled());
            this.addStep(new Step(line, h, cells, "countFromBothSides"));
        }
    }

    /**
     * When we have a filled cell on the edge, we can draw the hint on that edge
     * and an empty cell right next to it.
     */
    drawFromTheEdgeRule(line) {
        const firstHint = line.hints[0];
        const firstCell = line.cells[0];

        const lastHint = line.hints[line.hints.length - 1];
        const lastCell = line.cells[line.cells.length - 1];

        if (! firstHint.solved && firstCell.isFilled()) {
            const cells = line.cells.slice(0, firstHint.nr + 1);
            cells.forEach(cell => cell.markFilled());
            cells[firstHint.nr].markEmpty();
            firstHint.solved = true;
            this.addStep(new Step(line, 0, cells, "fromTheEdge"))
        }
        if (! lastHint.solved && lastCell.isFilled()) {
            const cells = line.cells.slice(line.cells.length - lastHint.nr - 1);
            cells.forEach(cell => cell.markFilled());
            cells[0].markEmpty();
            lastHint.solved = true;
            this.addStep(new Step(line, line.hints.length - 1, cells, "fromTheEdge"))
        }
    }

    fillBeforeFirstEmptyFromEdge(line) {
        // if there is an empty cell in the line
        // and there is a filled cell before it
        // and there is less than 2 * hint + 1 cells between the edge and the empty cell
        // then we can fill the cells between the edge and the empty cell
        const emptyCells = line.cells.filter(cell => cell.isEmpty());
        if (emptyCells.length === 0) return;

        const filledCells = line.cells.filter(cell => cell.isFilled());
        if (filledCells.length === 0) return;

        const firstEmptyCell = emptyCells[0];
        const firstFilledCell = filledCells[0];
        const firstEmptyCellIndex = line.cells.indexOf(firstEmptyCell);
        const firstFilledCellIndex = line.cells.indexOf(firstFilledCell);

        let hint = line.hints[0];
        if (firstFilledCellIndex < firstEmptyCellIndex && firstEmptyCellIndex < 2 * hint.nr) {
            const subLine = new Line('', line.cells.slice(0, firstEmptyCellIndex), [hint]);
            this.drawFromTheEdgeRule(subLine);
            this.countFromBothSidesRule(subLine);
        }

        const lastEmptyCell = emptyCells[emptyCells.length - 1];
        const lastFilledCell = filledCells[filledCells.length - 1];
        const lastEmptyCellIndex = line.cells.indexOf(lastEmptyCell);
        const lastFilledCellIndex = line.cells.indexOf(lastFilledCell);

        hint = line.hints[line.hints.length - 1];
        if (lastFilledCellIndex > lastEmptyCellIndex && lastEmptyCellIndex > line.cells.length - 2 * hint.nr) {
            const subLine = new Line('', line.cells.slice(lastEmptyCellIndex + 1), [hint]);
            this.drawFromTheEdgeRule(subLine);
            this.countFromBothSidesRule(subLine);
        }
    }
}
