import {useEffect, useRef} from "react";
import css from './InputCanvas.module.scss';

require('canvasinput/CanvasInput');

export default function InputCanvas({width, height, inputPos, board, r, c, destructor}) {
    const ref = useRef(null);

    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        const input = new window.CanvasInput({
            canvas: canvas,
            x: inputPos.x,
            y: inputPos.y,
            fontSize: 18,
            fontFamily: 'Courier New',
            fontColor: '#212121',
            fontWeight: 'bold',
            width: 150,
            padding: 8,
            borderWidth: 1,
            borderColor: '#000',
            borderRadius: 3,
            boxShadow: '1px 1px 0px #fff',
            innerShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
            onkeydown: (e) => {
                if (e.key === 'Escape') {
                    input.destroy();
                    destructor();
                }
                // only numbers and spaces allowed
                if (! isFinite(e.key) && e.key !== ' ' && e.key !== 'Backspace') {
                    e.preventDefault();
                }
            },
            onsubmit: (e) => {
                const values = input._value.split(' ').filter(Number).map(Number);
                if (r >= 0) {
                    board.rowHints[r] = values;
                } else {
                    board.colHints[c] = values;
                }
                input.destroy();
                destructor();
            }
        });

        input.render();
        input.focus(0);
    }, []);

    return (
        <canvas className={css.root} ref={ref} width={width} height={height}></canvas>
    );
};
