import {useState} from "react";
import Canvas from "./components/Canvas";
import NonogramInput from "./components/NonogramInput";
import Board from "./solver/Board";
import Button from "./components/Button";
import css from "./App.module.scss";

function App() {
    const [input, setInput] = useState("");

    const board = new Board(20, 20);

    return (
        <div className={css.root}>
            <header className={css.header}>
                <h1>Nonogram solver</h1>
            </header>
            <section>
                <Button onClick={() => board.clear()}>⬅️ Clear</Button>
                <NonogramInput input={input} onChange={(e) => setInput(e.target.value)} />
                <Button onClick={() => board.solve(input)}>🚀 Solve</Button>
            </section>
            <main>
                <Canvas board={board} />
            </main>
        </div>
    );
}

export default App;
