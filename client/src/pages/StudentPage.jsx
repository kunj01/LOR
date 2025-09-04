import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import PageWrapper from "../components/UI/PageWrapper";
import { useNavigate } from "react-router";
import Button from "../components/UI/Buttons";
import toast from "react-hot-toast";
import { FiSettings } from "react-icons/fi";
import axios from "axios";
import apiInfo from "../helpers/API/apiInfo";
import getApi from "../helpers/API/getApi";
import postApi from "../helpers/API/postApi";
import FirstTimeLoginForm from "../components/StudentProfile/FirstTimeLoginForm";
import StudentProfileView from "../components/StudentProfile/StudentProfileView";

function PasswordStrength({ password }) {
  let strength = 0;
  if (password.length > 5) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  const levels = ["Very Weak", "Weak", "Medium", "Strong", "Very Strong"];
  return (
    <div className="mt-1 text-xs">
      <div className={`h-2 w-full rounded bg-gray-200 mb-1 overflow-hidden`}>
        <div
          className={`h-2 rounded transition-all duration-300 ${
            strength === 0 ? "w-1/5 bg-red-400" :
            strength === 1 ? "w-2/5 bg-orange-400" :
            strength === 2 ? "w-3/5 bg-yellow-400" :
            strength === 3 ? "w-4/5 bg-blue-400" :
            "w-full bg-green-500"
          }`}
        ></div>
      </div>
      <span className="text-gray-500">{levels[strength]}</span>
    </div>
  );
}

export default function StudentPage() {
  const { userInfo, logoutUser, createLORRequest, getMyLORRequests } = useContext(UserContext);
  const navigate = useNavigate();
  
  // Profile management state
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // LOR minimal form state
  const [teacherId, setTeacherId] = useState("");
  const [purpose, setPurpose] = useState("");
  const [lorLoading, setLorLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadRequests() {
    const items = await getMyLORRequests();
    setRequests(items);
  }

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
    loadRequests();
    (async () => {
      try {
        const res = await getApi('/lor/teachers');
        if (res?.statusCode === 200) setTeachers(res.data);
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfileData = async () => {
    try {
      setProfileLoading(true);
      const response = await getApi('/students/profile');
      
      if (response?.statusCode === 200) {
        setProfileData(response.data);
      } else if (response?.statusCode === 404) {
        // Profile doesn't exist yet
        setProfileData(null);
      } else {
        console.error('Failed to load profile:', response);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfileData(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileComplete = (newProfileData) => {
    setProfileData(newProfileData);
    toast.success('Profile completed successfully!');
  };

  const handleProfileUpdate = (updatedProfileData) => {
    setProfileData(updatedProfileData);
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

  const isValid =
    currentPassword &&
    newPassword &&
    confirmPassword &&
    newPassword === confirmPassword &&
    newPassword.length >= 6;

  async function handleSubmitLOR(e) {
    e.preventDefault();
    if (!teacherId.trim()) {
      toast.error("Teacher ID is required");
      return;
    }
    setLorLoading(true);
    try {
      const res = await createLORRequest({ teacherId: teacherId.trim(), purpose: purpose.trim() });
      if (res && res.id) {
        // Optimistically add to list
        setRequests(prev => [{ id: res.id, teacherId: teacherId.trim(), purpose: purpose.trim(), status: 'PENDING', createdAt: new Date().toISOString() }, ...prev]);
        // Upload files if selected
        if (files.length > 0) {
          const formData = new FormData();
          for (const f of files) formData.append("files", f);
          await axios.post(`${apiInfo.URL}/lor/${res.id}/documents`, formData, {
            withCredentials: true,
          });
        }
        setTeacherId("");
        setPurpose("");
        setFiles([]);
        // Refresh list to ensure consistency
        await loadRequests();
      }
    } finally {
      setLorLoading(false);
    }
  }

  // If profile is loading, show loading state
  if (profileLoading) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // If no profile exists, show first-time login form
  if (!profileData) {
    return (
      <PageWrapper>
        <FirstTimeLoginForm onProfileComplete={handleProfileComplete} />
      </PageWrapper>
    );
  }

  // If profile exists, show main student dashboard
  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  Student Dashboard - LOR/Feedback Platform
                </h1>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                    title="Profile"
                    onClick={() => setShowProfile(true)}
                  >
                    <span className="text-sm text-gray-700 hover:text-gray-900">Profile</span>
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

              {/* Profile Modal */}
              {showProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-5/6 overflow-y-auto relative">
                    <button
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 z-10"
                      onClick={() => {
                        setShowProfile(false);
                        setIsEditMode(false);
                      }}
                    >
                      <span className="text-2xl">&times;</span>
                    </button>
                    <StudentProfileView
                      profileData={profileData}
                      isEditMode={isEditMode}
                      onEditMode={setIsEditMode}
                      onProfileUpdate={handleProfileUpdate}
                    />
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
                        <PasswordStrength password={newPassword} />
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
                      in as a student. Your profile is complete and you can now request LORs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm md:col-span-2 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Request a Letter of Recommendation
                  </h3>
                  <form onSubmit={handleSubmitLOR} className="space-y-3 text-sm text-gray-600">
                    <div>
                      <label className="block text-sm font-medium mb-1">Teacher</label>
                      <select
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={teacherId}
                        onChange={(e) => setTeacherId(e.target.value)}
                        required
                      >
                        <option value="">Select teacher</option>
                        {teachers.map(t => (
                          <option key={t.id} value={t.id}>{t.id} - {t.name || t.email}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Purpose (optional)</label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="e.g., MS Application"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Supporting Documents</label>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => setFiles(Array.from(e.target.files || []))}
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <p className="text-xs text-gray-500 mt-1">Up to 5 files. PDF/Images preferred.</p>
                    </div>
                    <Button type="PRIMARY" extraClasses="w-full" disabled={lorLoading}>
                      {lorLoading ? "Submitting..." : "Submit LOR Request"}
                    </Button>
                  </form>
                </div>
              </div>

              <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">My LOR Requests</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {requests.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No requests yet</td>
                        </tr>
                      ) : (
                        requests.map((r) => (
                          <tr key={r.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{r.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{r.teacherId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{r.purpose || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{r.status}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{ r.comment ? r.comment : '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(r.createdAt).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
