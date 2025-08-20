import { Logo } from "../UI/Logo";
import Logout from "../UI/Logout";
import { PiList } from "react-icons/pi";
import { useContext, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { Link, useNavigate } from "react-router-dom";
import Button from "../UI/Buttons";
import ResetPasswordModal from "../UI/ResetPasswordModal";

export default function Header({ toggleSidebar, isSidebarOpen }) {
    const { userInfo } = useContext(UserContext);
    const [showReset, setShowReset] = useState(false);
    const navigate = useNavigate();
    
    return (
        <header className="w-full h-16 bg-white border-b border-gray-200 shadow-sm">
            <div className="h-full px-4 flex items-center justify-between">
                {/* Left side - Hamburger menu and logo */}
                <div className="flex items-center gap-4">
                    <button 
                        onClick={toggleSidebar}
                        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <PiList className="text-2xl" />
                    </button>
                    <div className="hidden md:block">
                        <Logo size={"25%"} className="w-32" />
                    </div>
                </div>

                {/* Center - Title */}
                <div className="flex-1">
                    <h1 className="text-xl font-semibold text-gray-800">
                        Letter of Recommendation System
                    </h1>
                </div>

                {/* Right side - Profile and logout */}
                <div className="flex items-center gap-2">
                    <Button type="PRIMARY" onClick={() => setShowReset(true)}>
                        Reset Password
                    </Button>
                    <Logout />
                </div>
                {showReset && (
                    <ResetPasswordModal onClose={() => setShowReset(false)} />
                )}
            </div>
        </header>
    )
}