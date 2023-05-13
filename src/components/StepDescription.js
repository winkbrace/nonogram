import css from "./StepDescription.module.scss";

export default function StepDescription(props) {
    const { step } = props;

    console.log("step: ", step);

    return (
        <div className={css.root}>
            <h2>On {step?.line.id}</h2>
            <p>{step?.description}</p>
        </div>
    );
}
