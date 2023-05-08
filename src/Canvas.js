import css from './Canvas.module.scss';
import {useEffect, useRef} from "react";

/**
 * This component is responsible for rendering the canvas with the current nonogram state.
 */
export default function Canvas({rows, cols}) {
    const ref = useRef(null);

    const size = 20;
    const numbersWidth = 6 * size;
    const numbersHeight = 6 * size;
    const boardWidth = size * cols;
    const boardHeight = size * rows;
    const width = numbersWidth + boardWidth;
    const height = numbersHeight + boardHeight;

    const drawBoard = (ctx) => {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;

        // draw the board
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++){
                ctx.strokeRect(
                    width - ((c + 1) * size) - 1,
                    height - ((r + 1) * size) - 1,
                    size,
                    size
                );
            }
        }

        // draw the numbers area
        for (let r = 0; r < rows; r++) {
            ctx.strokeRect(
                1,
                height - ((r + 1) * size) - 1,
                numbersHeight - 2,
                size
            );
        }
        for (let c = 0; c < cols; c++) {
            ctx.strokeRect(
                width - ((c + 1) * size) - 1,
                1,
                size,
                numbersWidth - 2
            );
        }
    }

    const fillCell = (ctx, r, c, color) => {
        if (r < 0 || r >= rows || c < 0 || c >= cols)
            return;

        ctx.fillStyle = color;
        ctx.fillRect(
            width - ((cols - c) * size),
            height - ((rows - r) * size),
            size,
            size
        );
    }

    const findCellAt = (x, y) => {
        const r = Math.floor((y - numbersHeight) / size);
        const c = Math.floor((x - numbersWidth) / size);
        return {r, c};
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

        fillCell(ctx, r, c, 'black');
    };

    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas.getContext('2d');
        drawBoard(ctx);

        canvas.removeEventListener('click', handleClick); // prevent double assignment
        canvas.addEventListener('click', handleClick);

    }, []);

    return (
        <canvas
            ref={ref}
            className={css.root}
            width={`${width}px`}
            height={`${height}px`}
        />
    );
}
