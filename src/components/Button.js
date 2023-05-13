import css from "./Button.module.scss";

export default function Button({children, onClick}) {
    return (
        <button onClick={onClick} className={css.root}>{children}</button>
    )
}
