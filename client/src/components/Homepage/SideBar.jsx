import { useContext } from "react";
import { motion } from "motion/react";
import { LORSystemNavContentInfo, AdminNavContentInfo } from "./SideBarInfo";
import { useNavigate } from "react-router";
import { UserContext } from "../../context/UserContext";

export default function SideMenu({ selected, setSelected, isOpen, onToggle }) {
    const { role } = useContext(UserContext);
    const navigate = useNavigate();

    const isAdminSection = window.location.pathname.startsWith("/admin");
    const NavContentInfo = isAdminSection ? AdminNavContentInfo : LORSystemNavContentInfo;

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: isOpen ? "0%" : "-100%" }}
                transition={{ duration: 0.3, type: "tween" }}
                className={`fixed md:relative z-50 md:z-auto h-full bg-white border-r border-gray-200 shadow-lg md:shadow-none ${isOpen ? "w-64" : "w-0"} md:w-64 transition-all duration-300`}
            >
                <div className="h-full flex flex-col">
                    {/* Sidebar Header with CHARUSAT logo */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <img src="/icons/charusat_logo.jpg" alt="CHARUSAT" className="w-28" />
                        </div>
                    </div>
                    
                    {/* Navigation Items */}
                    <div className="flex-1 p-4">
                        <div className="space-y-2">
                            {NavContentInfo.map((item, index) => {
                                const isSelected = selected ? selected === item.path : (window.location.pathname === item.path);
                                return (
                                    <button 
                                        key={index} 
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                                            isSelected 
                                                ? "bg-[#2273f5] text-white" 
                                                : "text-gray-700 hover:bg-blue-50"
                                        }`}
                                        onClick={() => {
                                            setSelected(item.path);
                                            navigate(item.path);
                                            // Close sidebar on mobile after selection
                                            if (window.innerWidth < 768) {
                                                onToggle();
                                            }
                                        }}
                                    >
                                        <div className="text-xl">
                                            {selected === item.path ? item.fillIcon : item.icon}
                                        </div>
                                        <span className="font-medium">{item.name}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Mobile Overlay */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={onToggle}
                />
            )}
        </>
    )
}