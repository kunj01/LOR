import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import PageWrapper from "../components/UI/PageWrapper";
import { useNavigate } from "react-router";
import Button from "../components/UI/Buttons";
import toast from "react-hot-toast";
import { FiSettings } from "react-icons/fi";
import postApi from "../helpers/API/postApi";
import patchApi from "../helpers/API/patchApi";
import getApi from "../helpers/API/getApi";
import apiInfo from "../helpers/API/apiInfo";

export default function TeacherPage() {
  const { userInfo, logoutUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [showResetModal, setShowResetModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [commentMap, setCommentMap] = useState({});
  const [showProfile, setShowProfile] = useState(false);

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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    setLoading(true);
    try {
      const res = await postApi("/auth/reset", { currentPassword, newPassword });
      console.log("Password reset response:", res);
      
      if (res?.statusCode === 200) {
        toast.success("Password reset successful!");
        setShowResetModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const errorMessage = res?.message || "Failed to reset password.";
        setError(errorMessage);
        console.error("Password reset error:", res);
      }
    } catch (err) {
      console.error("Password reset catch error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await getApi("/lor/assigned");
      if (res?.statusCode === 200) {
        setRequests(res.data || []);
      }
    } catch (err) {
      console.error("Error loading requests:", err);
      toast.error("Failed to load requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleStatusUpdate = async (requestId, status, comment = "") => {
    try {
      const res = await patchApi(`/lor/${requestId}/status`, { status, comment });
      if (res?.statusCode === 200) {
        toast.success(`Request ${status.toLowerCase()}`);
        await loadRequests();
      } else {
        toast.error(res?.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status");
    }
  };

  const isValid =
    currentPassword &&
    newPassword &&
    confirmPassword &&
    newPassword === confirmPassword &&
    newPassword.length >= 6;

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  Teacher Dashboard - LOR/Feedback Platform
                </h1>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                    title="Profile"
                    onClick={() => setShowProfile(true)}
                  >
                    <span className="text-sm">Profile</span>
                  </button>
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                    title="Reset Password"
                    onClick={() => setShowResetModal(true)}
                  >
                    <FiSettings className="text-2xl text-gray-700" />
                  </button>
                  <Button
                    type="SECONDARY"
                    onClick={handleLogout}
                    extraClasses="px-4 py-2"
                  >
                    Logout
                  </Button>
                </div>
              </div>

              {showProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowProfile(false)}>
                      <span className="text-2xl">&times;</span>
                    </button>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Profile</h2>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Name:</strong> {userInfo?.name}</p>
                      <p><strong>ID:</strong> {userInfo?.id}</p>
                      <p><strong>Email:</strong> {userInfo?.email}</p>
                      <p><strong>Role:</strong> {userInfo?.role}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reset Password Modal */}
              {showResetModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                    <button
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                      onClick={() => setShowResetModal(false)}
                    >
                      <span className="text-2xl">&times;</span>
                    </button>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Reset Password</h2>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Current Password</label>
                        <input
                          type="password"
                          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">New Password</label>
                        <input
                          type="password"
                          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                      {error && <div className="text-red-600 text-sm">{error}</div>}
                      <Button
                        type="PRIMARY"
                        extraClasses="w-full"
                        disabled={!isValid || loading}
                      >
                        {loading ? "Resetting..." : "Reset Password"}
                      </Button>
                    </form>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Welcome, <strong>{userInfo?.name}</strong>! You are logged
                      in as a teacher.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Teacher Information
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
                    LOR Statistics
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Pending Requests:</span>
                      <span className="font-semibold">
                        {requests.filter(r => r.status === "PENDING").length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Approved:</span>
                      <span className="font-semibold">
                        {requests.filter(r => r.status === "APPROVED").length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rejected:</span>
                      <span className="font-semibold">
                        {requests.filter(r => r.status === "REJECTED").length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Button 
                      type="MAIN" 
                      extraClasses="w-full" 
                      onClick={loadRequests}
                      disabled={loadingRequests}
                    >
                      {loadingRequests ? "Loading..." : "Refresh Requests"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* LOR Requests Table */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned LOR Requests</h3>
                {loadingRequests ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Loading requests...</div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supporting Docs</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {requests.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                              No requests assigned yet
                            </td>
                          </tr>
                        ) : (
                          requests.map((request) => (
                            <React.Fragment key={request.id}>
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {request.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {request.student?.name || request.studentId}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.purpose || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {request.documents && request.documents.length > 0 ? (
                                  <div className="space-x-1">
                                    {request.documents.map((doc, idx) => (
                                      <a key={doc.id} className="text-blue-600 hover:underline" href={`${apiInfo.URL}/uploads/${doc.filename}`} target="_blank" rel="noreferrer">
                                        {idx === 0 ? 'View file' : `File ${idx+1}`}
                                      </a>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">None</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                  request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {request.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.comment ? request.comment : '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {request.status === 'PENDING' ? (
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      value={commentMap[request.id] || ''}
                                      onChange={(e) => setCommentMap(prev => ({ ...prev, [request.id]: e.target.value }))}
                                      placeholder="Comment (optional)"
                                      className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                    <div className="flex space-x-2">
                                      <Button
                                        type="PRIMARY"
                                        extraClasses="text-xs px-2 py-1"
                                        onClick={() => handleStatusUpdate(request.id, 'APPROVED', commentMap[request.id] || '')}
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        type="SECONDARY"
                                        extraClasses="text-xs px-2 py-1"
                                        onClick={() => handleStatusUpdate(request.id, 'REJECTED', commentMap[request.id] || '')}
                                      >
                                        Reject
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">No actions available</span>
                                )}
                              </td>
                            </tr>
                            </React.Fragment>
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
    </PageWrapper>
  );
}
