import Canvas from "./Canvas";
import css from "./App.module.scss";
import NonogramInput from "./NonogramInput";

function App() {
    return (
        <div className={css.root}>
            <header className={css.header}>
                <h1>Nonogram solver</h1>
                <NonogramInput />
            </header>
            <main>
                <Canvas rows={20} cols={20} />
            </main>
        </div>
    );
}

export default App;
