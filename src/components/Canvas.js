import {useEffect, useRef, useState} from "react";
import css from './Canvas.module.scss';
import InputCanvas from "./InputCanvas";

/**
 * This component is responsible for rendering the canvas with the current nonogram state.
 */
export default function Canvas({board}) {
    const {rows, cols} = board;
    const ref = useRef(null);
    const [inputCanvas, setInputCanvas] = useState(null);

    const cellSize = 20;
    const margin = 5;
    const rowHintSize = 5;
    const colHintSize = 5;
    const hintsWidth = rowHintSize * cellSize;
    const hintsHeight = colHintSize * cellSize;
    const boardWidth = cellSize * cols;
    const boardHeight = cellSize * rows;

    const [width, setWidth] = useState(hintsWidth + boardWidth + 2 * margin);
    const [height, setHeight] = useState(hintsHeight + boardHeight + 2 * margin);

    const redraw = () => {
        const canvas = ref.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        drawBoard(ctx);
    }

    const drawBoard = (ctx) => {
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
            ctx.strokeRect(x, y, hintsHeight, cellSize);
        }
        for (let c = 0; c < cols; c++) {
            const {x, y} = findPositionAt(-colHintSize, c);
            ctx.strokeRect(x, y, cellSize, hintsWidth);
        }
        // fat lines
        ctx.lineWidth = 2;
        for (let r = 0; r < rows; r+=5) {
            const {x, y} = findPositionAt(r, -rowHintSize);
            ctx.strokeRect(x, y, hintsWidth, cellSize * 5);
        }
        for (let c = 0; c < cols; c+=5) {
            const {x, y} = findPositionAt(-colHintSize, c);
            ctx.strokeRect(x, y, cellSize * 5, hintsWidth);
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
    }

    const fillCell = (ctx, r, c, color) => {
        if (r < 0 || r >= rows || c < 0 || c >= cols)
            return;

        ctx.fillStyle = color;
        ctx.fillRect(
            width - ((cols - c) * cellSize),
            height - ((rows - r) * cellSize),
            cellSize,
            cellSize
        );
    }

    function createInputCanvas(r, c) {
        const pos = findPositionAt(r, c, false);
        const values = board.getHintsAtPos(r, c).join(" ");

        const addToBoard = (values) => {
            if (r >= 0) {
                board.rowHints[r] = values;
            } else {
                board.colHints[c] = values;
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

        if (r < 0 && c >= 0 && c < cols) {
            createInputCanvas(-1, c);
        } else if (c < 0 && r >= 0 && r < rows) {
            createInputCanvas(r, -1);
        } else {
            fillCell(ctx, r, c, 'black');
        }
    };

    useEffect(() => {
        const ratio = window.devicePixelRatio;
        const canvas = ref.current;
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        const ctx = canvas.getContext('2d');
        ctx.scale(ratio, ratio);

        drawBoard(ctx);

        canvas.removeEventListener('click', handleClick); // prevent double assignment
        canvas.addEventListener('click', handleClick);
    });

    useEffect(() => {
        redraw();
    }, [width, height]);

    return (
        <div className={css.root} style={{width: `${width}px`}}>
            <canvas ref={ref} className={css.board} />
            {inputCanvas}
        </div>
    );
}
