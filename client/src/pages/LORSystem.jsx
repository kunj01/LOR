import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import StudentPage from "./StudentPage";
import AdminPage from "./AdminPage";

export default function LORSystem() {
    const { userInfo } = useContext(UserContext);

    // Render the appropriate page based on user role
    if (userInfo?.role === "STUDENT") {
        return <StudentPage />;
    } else if (userInfo?.role === "ADMIN") {
        return <AdminPage />;
    }

    // Default fallback
    return (
        <div className="h-full flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Welcome to LOR System
                </h2>
                <p className="text-gray-600">
                    Please select an option from the sidebar to get started.
                </p>
            </div>
        </div>
    );
} 