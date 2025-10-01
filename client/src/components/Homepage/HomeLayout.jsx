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
      <div className="flex-1 flex min-h-0">
        <SideMenu
          role={role}
          selected={selected}
          setSelected={setSelected || (() => {})}
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
        />
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto p-4 md:p-6 bg-[#f7f9fc]">
            <div className="mx-auto max-w-7xl bg-white rounded-lg shadow-sm border border-gray-200">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
