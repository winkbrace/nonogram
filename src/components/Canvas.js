import {useEffect, useRef, useState} from "react";
import css from './Canvas.module.scss';

/**
 * This component is responsible for rendering the canvas with the current nonogram state.
 */
export default function Canvas({board}) {
    const {rows, cols} = board;
    const ref = useRef(null);
    const [manualInput, setManualInput] = useState(null);

    const cellSize = 20;
    const hintsWidth = 6 * cellSize;
    const hintsHeight = 6 * cellSize;
    const boardWidth = cellSize * cols;
    const boardHeight = cellSize * rows;
    const width = hintsWidth + boardWidth;
    const height = hintsHeight + boardHeight;

    const redraw = () => {
        const canvas = ref.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        drawBoard(ctx);
    }

    const drawBoard = (ctx) => {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;

        // draw the board
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++){
                ctx.strokeRect(
                    width - ((c + 1) * cellSize) - 1,
                    height - ((r + 1) * cellSize) - 1,
                    cellSize,
                    cellSize
                );
            }
        }

        // draw the hints area
        for (let r = 0; r < rows; r++) {
            // draw the container
            ctx.strokeRect(
                1,
                height - ((r + 1) * cellSize) - 1,
                hintsHeight - 2,
                cellSize
            );

            // draw the hints
            const hintsLength = board.rowHints[r].length;
            if (! hintsLength) {
                continue;
            }
            for (let i = 0; i < hintsLength; i++) {
                const pos = findPositionAt(r, i - hintsLength + 1);
                ctx.strokeText(
                    board.rowHints[r][i],
                    pos.x - (cellSize * 0.75),
                    pos.y - (cellSize * 0.25)
                );
            }
        }
        for (let c = 0; c < cols; c++) {
            ctx.strokeRect(
                width - ((c + 1) * cellSize) - 1,
                1,
                cellSize,
                hintsWidth - 2
            );
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

    function drawInput(r, c) {
        const canvas = ref.current.cloneNode(true);
        const pos = findPositionAt(r, c);

        const input = new window.CanvasInput({
            canvas: canvas,
            x: pos.x,
            y: pos.y,
            value: '',
            fontSize: 18,
            fontFamily: 'Arial',
            fontColor: '#212121',
            fontWeight: 'bold',
            width: 200,
            padding: 8,
            borderWidth: 1,
            borderColor: '#000',
            borderRadius: 3,
            boxShadow: '1px 1px 0px #fff',
            innerShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
            onkeydown: (e) => {
                // only numbers and spaces allowed
                if (! isFinite(e.key) && e.key !== ' ') {
                    e.preventDefault();
                }
            },
            onsubmit: (e) => {
                const values = input._value.split(' ').filter(Number).map(Number);
                if (r > 0) {
                    board.rowHints[r] = values;
                } else {
                    board.colHints[c] = values;
                }
                input.destroy();
                redraw();
            }
        });

        input.render();
        input.focus(0);
    }

    const findCellAt = (x, y) => {
        const r = Math.floor((y - hintsHeight) / cellSize);
        const c = Math.floor((x - hintsWidth) / cellSize);
        return {r, c};
    }

    const findPositionAt = (r, c) => {
        const x = hintsWidth + (c * cellSize);
        const y = hintsHeight + (r * cellSize);

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
            setManualInput({col: c});
        } else if (c < 0 && r >= 0 && r < rows) {
            setManualInput({row: r});
        } else {
            fillCell(ctx, r, c, 'black');
        }
    };

    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas.getContext('2d');
        drawBoard(ctx);

        canvas.removeEventListener('click', handleClick); // prevent double assignment
        canvas.addEventListener('click', handleClick);
    }, []);

    // Draw manual input field at cursor for the number input areas.
    // This is triggered when user clicks on the area.
    useEffect(() => {
        if (!manualInput)
            return;

        const {row, col} = manualInput;

        drawInput(row ?? 0, col ?? 0);
    }, [manualInput]);

    return (
        <canvas
            ref={ref}
            className={css.root}
            width={`${width}px`}
            height={`${height}px`}
        />
    );
}
