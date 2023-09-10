export default class Step {
    descriptions = {
        done: "Done! There are no more steps to take.",
        noHints: "No hints means that all cells are empty.",
        countFromBothSides: "If we count from the edge on both sides of the line and hints have overlapping cells, that means that these cells must be filled.",
        fromTheEdge: "When we have a filled cell on the edge, we can draw the hint on that edge.",
        fillFirstHint: "When we have an empty cell with a filled cell before it, we can fill in the first hint from the edge."
    };

    constructor(line, hintIndex, cells, rule) {
        this.line = line;
        this.hintIndex = hintIndex;
        this.cells = cells;
        this.rule = rule;
    }

    get description() {
        return this.descriptions[this.rule];
    }
}
