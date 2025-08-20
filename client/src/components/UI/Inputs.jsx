import { useState } from "react";
import ErrorText from "./ErrorText";
import { RiEyeCloseLine, RiEyeLine } from "react-icons/ri"

export default function Input({ Type, labelText, errorText, type, options = [], extraClasses, ...props }) {
    const [isVisible, setIsVisible] = useState(false);

    let inputClasses = "", labelClasses = "";
    if (Type === "PRIMARY") inputClasses = "input-primary";
    if (Type === "SECONDARY") inputClasses = "input-secondary";

    if (props.value?.trim() !== "") labelClasses = " !top-[0rem] !left-[0px]";

    // Password Input
    if (type === "password") {
        inputClasses += " password-input";
        return (
            <div className={`py-2 pb-4 relative ${labelText && "pt-6"} ` + extraClasses}>
                <div
                    className="absolute top-[2rem] right-3 p-1 text-[1.2rem] rounded-2xl cursor-pointer"
                    onClick={() => setIsVisible((prev) => !prev)}
                >
                    {isVisible ? <RiEyeLine /> : <RiEyeCloseLine />}
                </div>
                <input
                    {...props}
                    type={isVisible ? "text" : "password"}
                    className={`peer z-10 cursor-text bg-transparent ${errorText ? "!border-background-red" : ""} ` + inputClasses}
                />
                {labelText && (
                    <label className={"absolute top-[2.2rem] left-4 pointer-events-none text-sm peer-focus:top-0 peer-focus:left-0 font-[550] text-font-dark dark:text-font-light transition-all ease-in-out duration-300 z-[0]" + labelClasses}>
                        {labelText}
                    </label>
                )}
                {errorText && (
                    <ErrorText>
                        {errorText}
                    </ErrorText>
                )}
            </div>
        );
    }

    // Select Dropdown
    if (type === "dropdown") {
        return (
            <div className={`py-2 pb-4 relative ${labelText && "pt-6"} ` + extraClasses}>
                <select
                    {...props}
                    className={"peer z-10 cursor-pointer bg-transparent appearance-none !py-[10px] " + inputClasses}
                >
                    <option defaultChecked hidden></option>
                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                {labelText && (
                    <label className={"absolute top-[2.15rem] left-4 pointer-events-none text-sm peer-focus:top-0 peer-focus:left-0 font-[550] text-font-dark dark:text-font-light transition-all ease-in-out duration-300 z-[0] " + labelClasses}>
                        {labelText}
                    </label>
                )}
                {errorText && (
                    <ErrorText>
                        {errorText}
                    </ErrorText>
                )}
            </div>
        );
    }
    if (type === "dropdown2") {
        return (
            <div className={`py-2 pb-4 relative ${labelText && "pt-6"} ` + extraClasses}>
                <select
                    {...props}
                    className={"peer z-10 cursor-pointer bg-transparent appearance-none !py-[10px] " + inputClasses}
                >
                    <option defaultChecked hidden></option>
                    {options.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.name}
                        </option>
                    ))}
                </select>
                {labelText && (
                    <label className={"absolute top-[2.15rem] left-4 pointer-events-none text-sm peer-focus:top-0 peer-focus:left-0 font-[550] text-font-dark dark:text-font-light transition-all ease-in-out duration-300 z-[0]" + labelClasses}>
                        {labelText}
                    </label>
                )}
                {errorText && (
                    <ErrorText>
                        {errorText}
                    </ErrorText>
                )}
            </div>
        );
    }

    if (type === "time") {
        return (
            <div className={`py-2 pb-4 relative ${labelText && "pt-6"} ` + extraClasses}>
                <input {...props} type={type} className={"peer z-10 cursor-text bg-transparent !py-[8px] " + inputClasses} />
                {labelText && (
                    <label className={"absolute top-[2.2rem] left-4 pointer-events-none text-sm peer-focus:top-0 peer-focus:left-0 font-[550] text-font-dark dark:text-font-light transition-all ease-in-out duration-300 z-[0]" + labelClasses}>
                        {labelText}
                    </label>
                )}
                {errorText && (
                    <ErrorText>
                        {errorText}
                    </ErrorText>
                )}
            </div>
        );
    }

    // Default Input
    return (
        <div className={`py-2 pb-4 relative ${labelText && "pt-6"} ` + extraClasses}>
            <input {...props} type={type} className={`peer z-10 cursor-text bg-transparent ${errorText ? "!border-background-red" : ""} ` + inputClasses} />
            {labelText && (
                <label className={"absolute top-[2.25rem] left-4 pointer-events-none text-sm peer-focus:top-0 peer-focus:left-0 font-[550] text-font-dark dark:text-font-light transition-all ease-in-out duration-300 z-[0]" + labelClasses}>
                    {labelText}
                </label>
            )}
            {errorText && (
                <ErrorText>
                    {errorText}
                </ErrorText>
            )}
        </div>
    );
}
