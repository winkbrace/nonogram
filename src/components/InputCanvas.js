import {useEffect, useRef} from "react";
import cx from "classnames";
import css from './InputCanvas.module.scss';

require('canvasinput/CanvasInput');

export default function InputCanvas({width, height, inputPos, addToBoard, destructor, next, old}) {
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
            fontFamily: 'Monaco, monospace',
            fontColor: '#212121',
            fontWeight: 'bold',
            width: 150,
            padding: 8,
            borderWidth: 1,
            borderColor: '#000',
            borderRadius: 3,
            boxShadow: '1px 1px 0px #fff',
            innerShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
            value: old,
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
                addToBoard(values);

                input.destroy();
                destructor();
            }
        });

        // destroy the input if the users clicks outside of it
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = Math.floor(e.clientX - rect.left);
            const y = Math.floor(e.clientY - rect.top);
            if (x < inputPos.x || x > inputPos.x + 170 || y < inputPos.y || y > inputPos.y + 40) {
                console.log("clicked outside the input at ", x, y);
                input.destroy();
                destructor();
            }
        });

        input.render();
        input.focus(old.length);
    });

    return (
        <canvas className={cx(css.root, 'input-canvas')} ref={ref} width={width} height={height}></canvas>
    );
};
