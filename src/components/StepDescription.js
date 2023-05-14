import css from "./StepDescription.module.scss";

export default function StepDescription(props) {
    const { step } = props;

    const title = step ? "On " + step?.line.id : "";

    return (
        <div className={css.root}>
            <h2>{title}</h2>
            <p>{step?.description}</p>
        </div>
    );
}
