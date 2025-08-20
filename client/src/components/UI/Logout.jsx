import { useContext } from "react"
import { UserContext } from "../../context/UserContext"
import toast from "react-hot-toast";
import Button from "./Buttons";
import { PiPower } from "react-icons/pi";
import { useNavigate } from "react-router";

export default function Logout(){

    const { logoutUser } = useContext(UserContext);
    const navigate = useNavigate();

    async function handleLogout(){
        try {
            const res = await logoutUser();
            if(res){
                toast.success("Logged out successfully");
                // Navigate to login page with replace to prevent back navigation
                navigate("/", { replace: true });
            } else {
                toast.error("Logout failed. Please try again.");
            }
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Logout failed. Please try again.");
            // Even if logout fails, navigate to login page
            navigate("/", { replace: true });
        }
    }

    return (
        <Button
            type="DANGER"
            onClick={handleLogout}
            extraClasses={"flex justify-center items-center"}
        >
            <PiPower className="inline-block text-xl mt-[-4px] mr-1" />
            Logout
        </Button>
    )
}