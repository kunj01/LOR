import { MdError } from "react-icons/md";

export default function ErrorText({children}){
    return (
        <p className="absolute top-16 px-[4px] pt-[2px] text-sm text-background-red">
            <MdError className="inline-block mt-[-3px] mr-[2px]" />
            {children}
        </p>
    )
}