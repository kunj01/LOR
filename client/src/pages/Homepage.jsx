import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import HomeLayout from "../components/Homepage/HomeLayout";
import { useNavigate } from "react-router";
import { Logo } from "../components/UI/Logo";
import PageWrapper from "../components/UI/PageWrapper";
import LoadingAnimation from "../components/UI/Loading";

export default function Homepage() {
    const location = window.location.pathname;
    console.log(location);

    const [isLoading, setIsLoading] = useState(true);
    const [selected, setSelected] = useState(location);

    const { role, pingUser } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        pingUserHandler();
    }, [selected]);

    async function pingUserHandler() {
        console.log("Pinging user");

        const res = await pingUser();
        setIsLoading(false);
        if (!res) {
            console.log("User not authorized");
            navigate("/");
        } else {
            console.log("User authorized");
            // Default to LOR System if on home page
            if(location === "/home" || location === "/home/") {
                setSelected("/dashboard/lor");
                navigate("/dashboard/lor");
            }
        }
    }

    if (isLoading) {
        return (
            <PageWrapper>
                <main className="w-screen h-screen flex items-center justify-center">
                    <div className="w-[15rem] inline-flex flex-col items-center">
                        <Logo size={"100%"} className="mb-6" />
                        <LoadingAnimation />
                    </div>
                </main>
            </PageWrapper>
        )
    }

    return (
        <PageWrapper>
            <HomeLayout role={role} selected={selected} setSelected={setSelected} />
        </PageWrapper>
    );
}