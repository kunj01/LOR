import { Outlet } from "react-router";
import SideMenu from "./SideBar";
import Header from "./Header";
import Container from "../UI/Container";
import { useState } from "react";

export default function HomeLayout({ role, selected, setSelected }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <main className="h-screen flex flex-col bg-gray-50">
            <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
            <div className="flex-1 flex overflow-hidden">
                <SideMenu 
                    role={role}
                    selected={selected}
                    setSelected={setSelected || (() => {})}
                    isOpen={isSidebarOpen}
                    onToggle={toggleSidebar}
                />
                <div className="flex-1 p-6 bg-[#f7f9fc] overflow-auto">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <Outlet />
                    </div>
                </div>
            </div>
        </main>
    )
}