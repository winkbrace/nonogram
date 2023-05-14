import {useEffect, useRef, useState} from "react";
import css from './Canvas.module.scss';
import InputCanvas from "./InputCanvas";

/**
 * This component is responsible for rendering the canvas with the current nonogram state.
 */
export default function Canvas({board}) {
    const ref = useRef(null);
    const margin = 5;
    const [rows, setRows] = useState(board.rows);
    const [cols, setCols] = useState(board.cols);
    const [cellSize, setCellSize] = useState(20);
    const [boardWidth, setBoardWidth] = useState(cellSize * cols);
    const [boardHeight, setBoardHeight] = useState(cellSize * rows);
    const [inputCanvas, setInputCanvas] = useState(null);
    const [rowHintSize, setRowHintSize] = useState(5);
    const [colHintSize, setColHintSize] = useState(5);
    const [hintsWidth, setHintsWidth] = useState(rowHintSize * cellSize);
    const [hintsHeight, setHintsHeight] = useState(colHintSize * cellSize);
    const [width, setWidth] = useState(hintsWidth + boardWidth + 2 * margin);
    const [height, setHeight] = useState(hintsHeight + boardHeight + 2 * margin);

    const redraw = () => {
        const canvas = ref.current;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, width, height);

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
            const {x, y} = findPositionAt(r, -rowHintSize);
            ctx.strokeRect(x, y, hintsWidth, cellSize);
        }
        for (let c = 0; c < cols; c++) {
            const {x, y} = findPositionAt(-colHintSize, c);
            ctx.strokeRect(x, y, cellSize, hintsHeight);
        }
        // fat lines
        ctx.lineWidth = 2;
        for (let r = 0; r < rows; r+=5) {
            const {x, y} = findPositionAt(r, -rowHintSize);
            ctx.strokeRect(x, y, hintsWidth, cellSize * 5);
        }
        for (let c = 0; c < cols; c+=5) {
            const {x, y} = findPositionAt(-colHintSize, c);
            ctx.strokeRect(x, y, cellSize * 5, hintsHeight);
        }
        ctx.lineWidth = 1;

        // draw the hints
        ctx.font = "bold " + Math.floor(cellSize * 0.65) + "px Courier New";
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

        // drawSolution(ctx);
    }

    const drawSolution = (ctx) => {
        board.getAllCells().forEach((cell) => {
            if (! cell) return;
            fillCell(ctx, cell.r, cell.c, cell.color);
        });
        ctx.fillStyle = 'black';
    }

    const fillCell = (ctx, r, c, color) => {
        if (r < 0 || r >= rows || c < 0 || c >= cols)
            return;

        const {x, y} = findPositionAt(r, c);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellSize, cellSize);
    }

    function createInputCanvas(r, c) {
        const values = board.getHintsAtPos(r, c).join(" ");
        const pos = findPositionAt(r, c, false);
        // ensure the inputs are placed inside the canvas
        pos.x = c > cols - 9 ? width - 180 : pos.x;
        pos.y = r === rows - 1 ? pos.y - cellSize : pos.y;

        const addToBoard = (values) => {
            if (r >= 0) {
                board.addRowHints(r, values);
                if (values.length > rowHintSize) {
                    setRowHintSize(values.length);
                }
            } else {
                board.addColHints(c, values);
                if (values.length > colHintSize) {
                    setColHintSize(values.length);
                }
            }
        }

        // We have to destroy the canvas, because it has 3 mouse event listeners from InputCanvas that get in the way.
        const destructor = () => {
            setInputCanvas(null);
            redraw();
        };

        setInputCanvas(
            <InputCanvas width={width} height={height} inputPos={pos} addToBoard={addToBoard} destructor={destructor} old={values} />
        )
    }

    const findCellAt = (x, y) => {
        const r = Math.floor((y - hintsHeight) / cellSize);
        const c = Math.floor((x - hintsWidth) / cellSize);
        return {r, c};
    }

    const findPositionAt = (r, c, withOffset = true) => {
        const x = hintsWidth + (c * cellSize) + margin - (withOffset ? 0.5 : 0);
        const y = hintsHeight + (r * cellSize) + margin - (withOffset ? 0.5 : 0);

        return {x, y};
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

    function setCanvasSize(width, height) {
        console.log("setting size to: ", width, height);
        const ratio = window.devicePixelRatio;
        const canvas = ref.current;
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        const ctx = canvas.getContext('2d');
        ctx.scale(ratio, ratio);
    }

    function resize(rowHintSize, colHintSize) {
        const hintsWidth = rowHintSize * cellSize;
        const hintsHeight = colHintSize * cellSize;
        const width = hintsWidth + boardWidth + 2 * margin;
        const height = hintsHeight + boardHeight + 2 * margin;
        setHintsWidth(hintsWidth);
        setHintsHeight(hintsHeight);
        setWidth(width);
        setHeight(height);
        setCanvasSize(width, height);
    }

    useEffect(() => {
        setRows(board.rows);
        setCols(board.cols);
        setCanvasSize(width, height);


        // TODO: I want to make a new canvas from App.js instead of resizing it here.




        redraw();

        const canvas = ref.current;
        canvas.removeEventListener('click', handleClick); // prevent double assignment
        canvas.addEventListener('click', handleClick);
    }, [board]);

    // add a listener to the board onInputChange event to redraw the board when the input changes
    board.onInputChange(() => {
        // Never shrink below 5
        const maxRowHintSize = Math.max(5, board.getMaxRowHintSize());
        const maxColHintSize = Math.max(5, board.getMaxColHintSize());

        if (maxRowHintSize <= rowHintSize && maxColHintSize <= colHintSize) {
            redraw();
            return;
        }

        setRowHintSize(maxRowHintSize);
        setColHintSize(maxColHintSize);

        resize(maxRowHintSize, maxColHintSize);
    });

    board.onNextStep((step) => {
        const canvas = ref.current;
        const ctx = canvas.getContext('2d');

        if (step.rule === "done") {
            return;
        }

        // highlight line
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'yellow';
        ctx.strokeStyle = 'yellow';
        const direction = step.line.id.substring(0, 3);
        const i = parseInt(step.line.id.substring(3));
        if (direction === "row") {
            const {x, y} = findPositionAt(i, 0);
            ctx.strokeRect(x, y, boardWidth, cellSize);
        } else {
            const {x, y} = findPositionAt(0, i);
            ctx.strokeRect(x, y, cellSize, boardHeight);
        }
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'black';

        // draw the discovered cells
        step.cells.forEach((cell) => {
            fillCell(ctx, cell.r, cell.c, cell.color);
        });
    });

    return (
        <div className={css.root} style={{width: `${width}px`, height: `${height}px`}}>
            <canvas ref={ref} className={css.board} />
            {inputCanvas}
        </div>
    );
}
