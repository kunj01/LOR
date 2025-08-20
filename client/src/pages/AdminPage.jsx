import { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import PageWrapper from "../components/UI/PageWrapper";
import { useNavigate } from "react-router";
import Button from "../components/UI/Buttons";
import toast from "react-hot-toast";

// Legacy AdminPage kept as-is for backward compatibility; not used in new routes
export default function AdminPage() {
  const { userInfo, logoutUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/auth/users", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await logoutUser();
      if (res) {
        toast.success("Logged out successfully");
        navigate("/", { replace: true });
      } else {
        toast.error("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
      navigate("/", { replace: true });
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  Admin Dashboard - LOR/Feedback Platform
                </h1>
                <Button
                  type="SECONDARY"
                  onClick={handleLogout}
                  extraClasses="px-4 py-2"
                >
                  Logout
                </Button>
              </div>

              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      Welcome, <strong>{userInfo?.name}</strong>! You have
                      administrative privileges.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Admin Information
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Name:</strong> {userInfo?.name}
                    </p>
                    <p>
                      <strong>ID:</strong> {userInfo?.id}
                    </p>
                    <p>
                      <strong>Email:</strong> {userInfo?.email}
                    </p>
                    <p>
                      <strong>Role:</strong> {userInfo?.role}
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Management Actions
                  </h3>
                  <div className="space-y-3">
                    <Button type="MAIN" extraClasses="w-full" disabled>
                      Review LOR Requests
                    </Button>
                    <Button type="SECONDARY" extraClasses="w-full" disabled>
                      Manage Students
                    </Button>
                    <Button type="SECONDARY" extraClasses="w-full" disabled>
                      Generate Reports
                    </Button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    LOR Statistics
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Pending Reviews:</span>
                      <span className="font-semibold">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed LORs:</span>
                      <span className="font-semibold">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Students:</span>
                      <span className="font-semibold">
                        {users.filter((user) => user.role === "STUDENT").length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* All Users/Students Section */}
              <div className="mt-8">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      All Users/Students
                    </h3>
                    <Button
                      type="SECONDARY"
                      extraClasses="text-sm"
                      onClick={fetchUsers}
                    >
                      Refresh
                    </Button>
                  </div>
                  {loading ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Loading users...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.length === 0 ? (
                            <tr>
                              <td
                                colSpan="5"
                                className="px-6 py-4 text-center text-sm text-gray-500"
                              >
                                No users found
                              </td>
                            </tr>
                          ) : (
                            users.map((user) => (
                              <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {user.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {user.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      user.role === "ADMIN"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    {user.role}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <Button
                                    type="SECONDARY"
                                    extraClasses="text-xs"
                                    disabled
                                  >
                                    Edit
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
