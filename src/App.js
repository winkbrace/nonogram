import {useState} from "react";
import Canvas from "./components/Canvas";
import NonogramInput from "./components/NonogramInput";
import Board from "./solver/Board";
import Button from "./components/Button";
import css from "./App.module.scss";
import Solver from "./solver/Solver";
import StepDescription from "./components/StepDescription";

function App() {
    const [input, setInput] = useState("c[4,4 4 4,1 5 5,2 2 1 3 4,5 2 5 3,3 1 2 2 2,1 1 3 1,1 2 1,1 3 1,1 1 2 1,1 2 4 1,1 1 2 2 1,3 1 5 2,4 3 2,2 2 2,1 6 2 1,1 4 9 1,4 7 1 1,1 3 1,2 1 1 2]r[3 3,1 3 3 1,2 10 3,2 2 2 3,4 5,2 3,1 3 3 1,1 2 2 2,1 2,1 2 2 2,1 4 4 3,1 2 1 1 2 2 1,1 4 4 2 1,1 2 3 2,2 2 1,2 3 2 1,3 3 2 2,4 1 2 2,4 2 1 1,11 1 3]");
    const [step, setStep] = useState(null);
    const [board, setBoard] = useState(Board.empty());
    const [solver, setSolver] = useState(new Solver(board));

    const drawCanvas = () => {
        console.log("drawCanvas clicked");
        const board = Board.fromInput(input);
        board.onNextStep((step) => setStep(step));

        setBoard(board);
        setSolver(new Solver(board));
    };

    return (
        <div className={css.root}>
            <header className={css.header}>
                <h1>Nonogram solver</h1>
            </header>
            <section>
                <Button onClick={() => board.clear()}>⬅️ Clear</Button>
                <NonogramInput input={input} onChange={(e) => setInput(e.target.value)} />
                <Button onClick={drawCanvas}>🚀 Parse</Button>
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
