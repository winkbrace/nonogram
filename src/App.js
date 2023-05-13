import {useState} from "react";
import Canvas from "./components/Canvas";
import NonogramInput from "./components/NonogramInput";
import Board from "./solver/Board";
import Button from "./components/Button";
import css from "./App.module.scss";
import Solver from "./solver/Solver";
import StepDescription from "./components/StepDescription";

function App() {
    const [input, setInput] = useState("");
    const [step, setStep] = useState(null);

    const board = new Board(20, 20);
    board.onNextStep((step) => setStep(step));

    const solver = new Solver(board);

    return (
        <div className={css.root}>
            <header className={css.header}>
                <h1>Nonogram solver</h1>
            </header>
            <section>
                <Button onClick={() => board.clear()}>⬅️ Clear</Button>
                <NonogramInput input={input} onChange={(e) => setInput(e.target.value)} />
                <Button onClick={() => board.parse(input)}>🚀 Parse</Button>
            </section>
            <main>
                <Canvas board={board} />
                <div>
                    <StepDescription step={step} />
                    <Button onClick={() => solver.step()}>👣 Step</Button>
                </div>
            </main>
        </div>
    );
}

export default App;
