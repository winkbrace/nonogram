import {useState} from "react";
import css from "./NonogramInput.module.scss";

export default function NonogramInput() {
    const [input, setInput] = useState("");

    return (
        <div className={css.root}>
            <input type="text" defaultValue={input} />
        </div>
    )
}
