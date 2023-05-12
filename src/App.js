import Canvas from "./components/Canvas";
import NonogramInput from "./components/NonogramInput";
import Board from "./solver/Board";
import css from "./App.module.scss";

require('canvasinput/CanvasInput');

function App() {
    const board = new Board(20, 20);

    return (
        <div className={css.root}>
            <header className={css.header}>
                <h1>Nonogram solver</h1>
                <NonogramInput />
            </header>
            <main>
                <Canvas board={board} />
            </main>
        </div>
    );
}

export default App;
