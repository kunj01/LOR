export default function Button({ type, extraClasses, ...props }){
    let buttonClasses;
    if(type === "PRIMARY") buttonClasses = "btn-primary";
    if(type === "SECONDARY") buttonClasses = "btn-secondary";
    if(type === "TERTIARY") buttonClasses = "btn-tertiary";
    if(type === "DANGER") buttonClasses = "btn-danger";
    if(type === "MAIN") buttonClasses = "btn-primary-main";
    if(type === "NAV") buttonClasses = "btn-nav";

    return (
        <button 
            {...props}
            className={buttonClasses + " " + extraClasses}
        />
    )
}