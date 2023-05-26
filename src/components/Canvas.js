import {useEffect, useRef, useState} from "react";
import css from './Canvas.module.scss';
import InputCanvas from "./InputCanvas";
import Hints from "../helpers/Hints";

/**
 * This component is responsible for rendering the canvas with the current nonogram state.
 */
export default function Canvas({board}) {
    const ref = useRef(null);
    const cellSize = 20;
    const size = {width: 800, height: 800};
    const [inputCanvas, setInputCanvas] = useState(null);
    const [rows, setRows] = useState(board.rows);
    const [cols, setCols] = useState(board.cols);
    const [grid, setGrid] = useState({width: cellSize * board.cols, height: cellSize * board.rows});
    const [hints, setHints] = useState(new Hints(cellSize, 5, 5));
    const [offset, setOffset] = useState({x: 150, y: 150}); // (800 - 5*20 - 20*20) / 2

    const resize = (board) => {
        setRows(board.rows);
        setCols(board.cols);
        // store in local variables to avoid race conditions.
        const g = {width: cellSize * board.cols, height: cellSize * board.rows};
        const h = hints.adjust(board);
        setGrid(g)
        setHints(h);
        setOffset({
            x: Math.floor((size.width - h.width - g.width) / 2),
            y: Math.floor((size.height - h.height - g.height) / 2)
        })
    };

    const redraw = () => {
        const canvas = ref.current;
        if (! canvas) {
            console.error("ref.current is not the canvas element.");
            return;
        }
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, size.width, size.height);

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;

        // draw the board
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const {x, y} = findPositionAt(r, c);
                ctx.strokeRect(x, y, cellSize, cellSize);

                if (r % 5 === 0 && c % 5 === 0) {
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x, y, cellSize * 5, cellSize * 5);
                }
                ctx.lineWidth = 1;
            }
        }

        // draw the hints area borders
        for (let r = 0; r < rows; r++) {
            const {x, y} = findPositionAt(r, -hints.rows);
            ctx.strokeRect(x, y, hints.width, cellSize);
        }
        for (let c = 0; c < cols; c++) {
            const {x, y} = findPositionAt(-hints.cols, c);
            ctx.strokeRect(x, y, cellSize, hints.height);
        }
        // fat lines
        ctx.lineWidth = 2;
        for (let r = 0; r < rows; r+=5) {
            const {x, y} = findPositionAt(r, -hints.rows);
            ctx.strokeRect(x, y, hints.width, cellSize * 5);
        }
        for (let c = 0; c < cols; c+=5) {
            const {x, y} = findPositionAt(-hints.cols, c);
            ctx.strokeRect(x, y, cellSize * 5, hints.height);
        }
        ctx.lineWidth = 1;

        // draw the hints
        ctx.font = "bold " + Math.floor(cellSize * 0.65) + "px Monaco";
        ctx.textAlign = "right";
        for (let r = 0; r < rows; r++) {
            const hintsLength = board.rowHints[r].length;
            if (!hintsLength) {
                continue;
            }
            for (let i = 0; i < hintsLength; i++) {
                const pos = findPositionAt(r + 1, i - hintsLength + 1);
                ctx.fillText(
                    board.rowHints[r][i],
                    Math.floor(pos.x - (cellSize * 0.25)),
                    Math.floor(pos.y - (cellSize * 0.25))
                );
            }
        }
        ctx.textAlign = "center";
        for (let c = 0; c < cols; c++) {
            const hintsLength = board.colHints[c].length;
            if (!hintsLength) {
                continue;
            }
            for (let i = 0; i < hintsLength; i++) {
                const pos = findPositionAt(i - hintsLength + 1, c + 1);
                ctx.fillText(
                    board.colHints[c][i],
                    Math.floor(pos.x - (cellSize * 0.5)),
                    Math.floor(pos.y - (cellSize * 0.32))
                );
            }
        }

        // Draw the cells previously filled by the user or the solver steps.
        board.shownCells.forEach((cell) => {
            const {x, y} = findPositionAt(cell.r, cell.c);
            ctx.fillStyle = 'black';
            ctx.fillRect(x, y, cellSize, cellSize);
        });
    };

    const fillCell = (ctx, r, c, color) => {
        if (r < 0 || r >= rows || c < 0 || c >= cols)
            return;

        const {x, y} = findPositionAt(r, c);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellSize, cellSize);

        board.addShownCell(r, c);
    }

    function createInputCanvas(r, c) {
        const values = board.getHintsAtPos(r, c).join(" ");
        const pos = findPositionAt(r, c, false);
        // ensure the inputs are placed inside the canvas
        pos.x = c > cols - 9 ? size.width - 180 : pos.x;
        pos.y = r === rows - 1 ? pos.y - cellSize : pos.y;

        const addToBoard = (values) => {
            if (r >= 0) {
                board.addRowHints(r, values);
            } else {
                board.addColHints(c, values);
            }
        }

        // We have to destroy the canvas, because it has 3 mouse event listeners from InputCanvas that get in the way.
        const destructor = () => {
            setInputCanvas(null);
            redraw();
        };

        setInputCanvas(
            <InputCanvas width={size.width} height={size.height} inputPos={pos} addToBoard={addToBoard} destructor={destructor} old={values} />
        )
    }

    const findCellAt = (x, y) => {
        const r = Math.floor((y - offset.y - hints.height) / cellSize);
        const c = Math.floor((x - offset.x - hints.width) / cellSize);
        return {r, c};
    }

    const findPositionAt = (r, c, withOffset = true) => {
        const x = offset.x + hints.width + (c * cellSize) - (withOffset ? 0.5 : 0);
        const y = offset.y + hints.height + (r * cellSize) - (withOffset ? 0.5 : 0);

        return {x, y};
    }

    const showStep = (step) => {
        const canvas = ref.current;
        const ctx = canvas.getContext('2d');

        redraw();

        if (! step || step.rule === "done") {
            return;
        }

        // highlight line
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'yellow';
        ctx.strokeStyle = 'yellow';
        const direction = step.line.id.substring(0, 3);
        const i = parseInt(step.line.id.slice(-2));
        if (direction === "row") {
            const {x, y} = findPositionAt(i, 0);
            ctx.strokeRect(x, y, grid.width, cellSize);
        } else {
            const {x, y} = findPositionAt(0, i);
            ctx.strokeRect(x, y, cellSize, grid.height);
        }

        // highlight hint
        if (direction === "row") {
            const {x, y} = findPositionAt(i, step.hintIndex - step.line.hints.length);
            ctx.strokeRect(x, y, cellSize, cellSize);
        } else {
            const {x, y} = findPositionAt(step.hintIndex - step.line.hints.length, i);
            ctx.strokeRect(x, y, cellSize, cellSize);
        }

        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'black';

        // draw the discovered cells
        step.cells.forEach((cell) => {
            fillCell(ctx, cell.r, cell.c, cell.color);
        });
    }

    const handleClick = (e) => {
        const canvas = ref.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);
        const {r, c} = findCellAt(x, y);

        console.log("mouse position: ", x, y);
        console.log("cell: ", r, c);

        if (inputCanvas) {
            setInputCanvas(null);
        } else if (r < 0 && c >= 0 && c < cols) {
            createInputCanvas(-1, c);
        } else if (c < 0 && r >= 0 && r < rows) {
            createInputCanvas(r, -1);
        } else {
            fillCell(ctx, r, c, 'black');
        }
    };

    useEffect(() => {
        resize(board);
        redraw();

        board.onInputChange(redraw);
        board.onNextStep(showStep);
    }, [board]);

    return (
        <div className={css.root} style={{width: `${size.width}px`, height: `${size.height}px`}}>
            <canvas
                ref={ref}
                className={css.board}
                width={size.width}
                height={size.height}
                style={{width: `${size.width}px`, height: `${size.height}px`}}
                onClick={handleClick}
            />
            {inputCanvas}
        </div>
    );
}
