import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Homepage from "./pages/Homepage";
import StudentPage from "./pages/StudentPage";
import AdminPage from "./pages/AdminPage";
import AdminHome from "./pages/admin/AdminHome";
import ManageStudents from "./pages/admin/ManageStudents";
import LORApplications from "./pages/admin/LORApplications";
import AdminSettings from "./pages/admin/AdminSettings";
import HomeLayout from "./components/Homepage/HomeLayout";
import LORSystem from "./pages/LORSystem";
import FeedbackPage from "./pages/FeedbackPage";
import Dashboard from "./pages/Dashboard";
import { AnimatePresence } from "motion/react";
import { useContext } from "react";
import { UserContext } from "./context/UserContext";
import UserContextProvider from "./context/UserContextProvider";
import AuthContextProvider from "./context/AuthContextProvider";
import Loading from "./components/UI/Loading";

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { userInfo, isInitialized } = useContext(UserContext);

  // Show loading while checking authentication
  if (!isInitialized) {
    return <Loading />;
  }

  if (!userInfo || Object.keys(userInfo).length === 0) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
    // Redirect based on role
    if (userInfo.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    } else if (userInfo.role === "STUDENT") {
      return <Navigate to="/student" replace />;
    }
  }

  return children;
}

function App() {
  return (
    <UserContextProvider>
      <AuthContextProvider>
        <AnimatePresence mode="wait">
          <Router>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/home" element={<Homepage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["STUDENT", "ADMIN"]}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="lor" replace />} />
                <Route path="lor" element={<LORSystem />} />
                <Route path="feedback" element={<FeedbackPage />} />
              </Route>
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={["STUDENT"]}>
                    <StudentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <HomeLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminPage />} />
                <Route path="students" element={<ManageStudents />} />
                <Route path="lor" element={<LORApplications />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Routes>
          </Router>
        </AnimatePresence>
      </AuthContextProvider>
    </UserContextProvider>
  );
}

export default App;
