import {useState} from "react";
import css from "./NonogramInput.module.scss";

export default function NonogramInput({input}) {
    const [value, setValue] = useState(input);

    if (input !== value) {
        setValue(input);
    }

    return (
        <div className={css.root}>
            <input type="text" defaultValue={value} />
        </div>
    )
}
