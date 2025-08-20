import { NavLink, Outlet, useLocation } from "react-router-dom";

export default function Dashboard() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center justify-center border-b">
          <span className="text-xl font-bold text-blue-700">Dashboard</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="lor"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive || location.pathname.endsWith("/dashboard")
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-blue-100"
              }`
            }
            end
          >
            LOR System
          </NavLink>
          <NavLink
            to="feedback"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-blue-100"
              }`
            }
          >
            Feedback Form
          </NavLink>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}