import React, { useContext, useEffect, useState, useMemo } from "react";
import { UserContext } from "../context/UserContext";
import PageWrapper from "../components/UI/PageWrapper";
import Tabs from "../components/UI/Tabs";
import { useNavigate } from "react-router";
import Button from "../components/UI/Buttons";
import toast from "react-hot-toast";
import { FiSettings, FiEye, FiSearch, FiFilter, FiGrid, FiList } from "react-icons/fi";
import { PiFilePdf, PiFileDoc, PiFile, PiDownload } from "react-icons/pi";
import postApi from "../helpers/API/postApi";
import patchApi from "../helpers/API/patchApi";
import getApi from "../helpers/API/getApi";
import apiInfo from "../helpers/API/apiInfo";
import Header from "../components/Homepage/Header";
import SideMenu from "../components/Homepage/SideBar";

export default function TeacherPage() {
  const { userInfo, logoutUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
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
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("table"); // "table" or "kanban"
  const [showPurposeModal, setShowPurposeModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [selectedComment, setSelectedComment] = useState("");

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
      const res = await postApi("/auth/reset", {
        currentPassword,
        newPassword,
      });
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
      const res = await patchApi(`/lor/${requestId}/status`, {
        status,
        comment,
      });
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

  const openDetails = async (id) => {
    try {
      setDetailLoading(true);
      const res = await getApi(`/lor/${id}`);
      if (res?.statusCode === 200) {
        setSelectedRequest(res.data);
        setDetailModalOpen(true);
      } else {
        toast.error(res?.message || "Failed to load details");
      }
    } catch (e) {
      toast.error("Failed to load details");
    } finally {
      setDetailLoading(false);
    }
  };

  const addComment = async () => {
    if (!selectedRequest?.id || !newComment.trim()) return;
    try {
      const res = await postApi(`/lor/${selectedRequest.id}/comments`, {
        body: newComment.trim(),
      });
      if (res?.statusCode === 201) {
        setSelectedRequest((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), res.data],
        }));
        setNewComment("");
      }
    } catch {}
  };

  const isValid =
    currentPassword &&
    newPassword &&
    confirmPassword &&
    newPassword === confirmPassword &&
    newPassword.length >= 6;

  // Filter and search logic
  const filteredRequests = useMemo(() => {
    let filtered = requests;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.student?.name?.toLowerCase().includes(query) ||
          req.studentId?.toString().includes(query) ||
          req.purpose?.toLowerCase().includes(query) ||
          req.id?.toString().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    return filtered;
  }, [requests, searchQuery, statusFilter]);

  const handleViewPurpose = (purpose) => {
    setSelectedPurpose(purpose || "No purpose provided");
    setShowPurposeModal(true);
  };

  const handleViewComment = (comment) => {
    setSelectedComment(comment || "No comment provided");
    setShowCommentModal(true);
  };

  const getFileIcon = (filename) => {
    const ext = filename?.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <PiFilePdf className="text-red-500" />;
    if (["doc", "docx"].includes(ext)) return <PiFileDoc className="text-blue-500" />;
    return <PiFile className="text-gray-500" />;
  };

  const overviewTab = (
    <div className="space-y-6">
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
                {requests.filter((r) => r.status === "PENDING").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Approved:</span>
              <span className="font-semibold">
                {requests.filter((r) => r.status === "APPROVED").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Rejected:</span>
              <span className="font-semibold">
                {requests.filter((r) => r.status === "REJECTED").length}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  const requestsTab = (
    <div className="space-y-4">
      {/* Search, Filter, and View Toggle */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name, ID, or purpose..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 border border-gray-300 rounded-md p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded ${
                viewMode === "table"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title="Table View"
            >
              <FiList className="text-lg" />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-2 rounded ${
                viewMode === "kanban"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title="Kanban View"
            >
              <FiGrid className="text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredRequests.length} of {requests.length} requests
      </div>

      {loadingRequests ? (
        <div className="text-center py-8">
          <div className="text-gray-500">Loading requests...</div>
        </div>
      ) : viewMode === "table" ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Supporting Docs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    {requests.length === 0
                      ? "No requests assigned yet"
                      : "No requests match your search/filter criteria"}
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <React.Fragment key={request.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {request.student?.name || request.studentId}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-xs">
                            {request.purpose ? (
                              (() => {
                                const words = request.purpose.split(" ");
                                const truncated = words.slice(0, 3).join(" ");
                                return words.length > 3 ? `${truncated}...` : truncated;
                              })()
                            ) : (
                              "-"
                            )}
                          </span>
                          {request.purpose && (
                            <button
                              onClick={() => handleViewPurpose(request.purpose)}
                              className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                              title="View full purpose"
                            >
                              <FiEye className="text-sm" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm hidden md:table-cell">
                        {request.documents && request.documents.length > 0 ? (
                          <div className="flex flex-wrap flex-col gap-2">
                            {request.documents.map((doc, idx) => (
                              <a
                                key={doc.id}
                                href={`${apiInfo.URL}/uploads/${doc.filename}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-xs transition-colors"
                                title={doc.originalName || doc.filename}
                              >
                                {getFileIcon(doc.filename)}
                                <span>
                                  {doc.originalName
                                    ? doc.originalName.length > 15
                                      ? `${doc.originalName.substring(0, 15)}...`
                                      : doc.originalName
                                    : `File ${idx + 1}`}
                                </span>
                                <PiDownload className="text-xs" />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            request.status === "PENDING"
                              ? "bg-yellow text-white/80"
                              : request.status === "APPROVED"
                              ? "bg-green text-white/80"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-2 items-start">
                          <Button
                            type="MAIN"
                            extraClasses="text-xs px-2 py-1 w-auto"
                            onClick={() => openDetails(request.id)}
                          >
                            View Details
                          </Button>
                          {request.status === "PENDING" ? (
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Button
                                type="PRIMARY"
                                extraClasses="text-xs px-2 py-1 w-auto"
                                onClick={() =>
                                  handleStatusUpdate(request.id, "APPROVED", "")
                                }
                              >
                                Approve
                              </Button>
                              <Button
                                type="SECONDARY"
                                extraClasses="text-xs px-2 py-1 w-auto"
                                onClick={() =>
                                  handleStatusUpdate(request.id, "REJECTED", "")
                                }
                              >
                                Reject
                              </Button>
                              <Button
                                type="MAIN"
                                extraClasses="text-xs px-2 py-1 w-auto"
                                onClick={() =>
                                  handleStatusUpdate(
                                    request.id,
                                    "CHANGES_REQUESTED",
                                    ""
                                  )
                                }
                              >
                                Request Changes
                              </Button>
                            </div>
                          ) : (
                            <span className="text-gray-400">
                              No actions available
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr className="md:hidden">
                      <td
                        colSpan="6"
                        className="px-6 pb-4 text-xs text-gray-700"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Purpose:</span>{" "}
                            {request.purpose ? (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-700">
                                  {(() => {
                                    const words = request.purpose.split(" ");
                                    const truncated = words.slice(0, 3).join(" ");
                                    return words.length > 3 ? `${truncated}...` : truncated;
                                  })()}
                                </span>
                                <button
                                  onClick={() => handleViewPurpose(request.purpose)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="View full purpose"
                                >
                                  <FiEye className="text-sm" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-gray-500">Docs:</span>{" "}
                            {request.documents?.length ? (
                              <div className="flex flex-wrap gap-2">
                                {request.documents.map((doc, idx) => (
                                  <a
                                    key={doc.id}
                                    href={`${apiInfo.URL}/uploads/${doc.filename}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-xs"
                                  >
                                    {getFileIcon(doc.filename)}
                                    <span>
                                      {doc.originalName || `File ${idx + 1}`}
                                    </span>
                                    <PiDownload className="text-xs" />
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      ) : (
        // Kanban View - Individual request cards
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRequests.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              {requests.length === 0
                ? "No requests assigned yet"
                : "No requests match your search/filter criteria"}
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">
                      ID: {request.id}
                    </span>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        request.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : request.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : request.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {request.student?.name || request.studentId}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Purpose:</span>
                    {request.purpose ? (
                      <div className="flex items-center gap-1 flex-1">
                        <span className="text-xs text-gray-700 truncate">
                          {(() => {
                            const words = request.purpose.split(" ");
                            const truncated = words.slice(0, 3).join(" ");
                            return words.length > 3 ? `${truncated}...` : truncated;
                          })()}
                        </span>
                        <button
                          onClick={() => handleViewPurpose(request.purpose)}
                          className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                          title="View full purpose"
                        >
                          <FiEye className="text-xs" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </div>
                  {request.documents && request.documents.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {request.documents.map((doc, idx) => (
                        <a
                          key={doc.id}
                          href={`${apiInfo.URL}/uploads/${doc.filename}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs"
                          title={doc.originalName || doc.filename}
                        >
                          {getFileIcon(doc.filename)}
                          <span className="truncate max-w-[60px]">
                            {doc.originalName || `File ${idx + 1}`}
                          </span>
                          <PiDownload className="text-xs" />
                        </a>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
                    <Button
                      type="MAIN"
                      extraClasses="text-xs px-2 py-1 w-full"
                      onClick={() => openDetails(request.id)}
                    >
                      View Details
                    </Button>
                    {request.status === "PENDING" && (
                      <div className="flex flex-wrap gap-1">
                        <Button
                          type="PRIMARY"
                          extraClasses="text-xs px-2 py-1 flex-1"
                          onClick={() =>
                            handleStatusUpdate(request.id, "APPROVED", "")
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          type="SECONDARY"
                          extraClasses="text-xs px-2 py-1 flex-1"
                          onClick={() =>
                            handleStatusUpdate(request.id, "REJECTED", "")
                          }
                        >
                          Reject
                        </Button>
                        <Button
                          type="MAIN"
                          extraClasses="text-xs px-2 py-1 w-full"
                          onClick={() =>
                            handleStatusUpdate(
                              request.id,
                              "CHANGES_REQUESTED",
                              ""
                            )
                          }
                        >
                          Request Changes
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  return (
    <main className="h-screen flex flex-col bg-gray-50">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <div className="flex-1 flex min-h-0">
        <SideMenu
          selected={null}
          setSelected={() => {}}
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
        />
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto  p-4 md:p-6 bg-[#f7f9fc]">
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
                <div 
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
                  onClick={() => setShowProfile(false)}
                >
                  <div 
                    className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                      onClick={() => setShowProfile(false)}
                    >
                      <span className="text-2xl">&times;</span>
                    </button>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                      Profile
                    </h2>
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
                </div>
              )}

              {/* Reset Password Modal */}
              {showResetModal && (
                <div 
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
                  onClick={() => setShowResetModal(false)}
                >
                  <div 
                    className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                      onClick={() => setShowResetModal(false)}
                    >
                      <span className="text-2xl">&times;</span>
                    </button>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                      Reset Password
                    </h2>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                      {error && (
                        <div className="text-red-600 text-sm">{error}</div>
                      )}
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

              <div className="px-1">
                <Tabs
                  tabs={[
                    { label: "Overview", content: overviewTab },
                    {
                      label: `Requests (${requests.length})`,
                      content: requestsTab,
                    },
                  ]}
                />
              </div>
            {/* </div> */}
          </div>
        </div>
      </div>
      {detailModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-40 overflow-auto"
          onClick={() => setDetailModalOpen(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-lg w-full max-w-4xl mt-10 mb-10 p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setDetailModalOpen(false)}
            >
              <span className="text-2xl">&times;</span>
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              LOR Request Details
            </h2>
            {detailLoading || !selectedRequest ? (
              <div className="text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded">
                    <h3 className="font-semibold mb-2">Student Profile</h3>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div>
                        <strong>Name:</strong>{" "}
                        {selectedRequest.student?.studentProfile
                          ?.studentFullName || selectedRequest.student?.name}
                      </div>
                      <div>
                        <strong>Student ID:</strong>{" "}
                        {selectedRequest.student?.studentProfile?.studentId}
                      </div>
                      <div>
                        <strong>Email:</strong> {selectedRequest.student?.email}
                      </div>
                      <div>
                        <strong>Mobile:</strong>{" "}
                        {
                          selectedRequest.student?.studentProfile
                            ?.candidateMobile
                        }
                      </div>
                      <div>
                        <strong>Admission:</strong>{" "}
                        {
                          selectedRequest.student?.studentProfile
                            ?.admissionMonth
                        }{" "}
                        {selectedRequest.student?.studentProfile?.admissionYear}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <h3 className="font-semibold mb-2">Request Info</h3>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div>
                        <strong>ID:</strong> {selectedRequest.id}
                      </div>
                      <div>
                        <strong>Purpose:</strong>{" "}
                        {selectedRequest.purpose || "-"}
                      </div>
                      <div>
                        <strong>Copies:</strong> {selectedRequest.copies || "-"}
                      </div>
                      <div>
                        <strong>Status:</strong> {selectedRequest.status}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Supporting Documents */}
                {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Supporting Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedRequest.documents.map((doc, idx) => (
                        <a
                          key={doc.id}
                          href={`${apiInfo.URL}/uploads/${doc.filename}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                        >
                          <div className="flex-shrink-0">
                            {getFileIcon(doc.filename)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {doc.originalName || `Document ${idx + 1}`}
                            </p>
                            {doc.size && (
                              <p className="text-xs text-gray-500">
                                {(doc.size / 1024).toFixed(2)} KB
                              </p>
                            )}
                          </div>
                          <PiDownload className="flex-shrink-0 text-gray-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Comments</h3>
                  <div className="space-y-2 max-h-64 overflow-auto border rounded p-3">
                    {(selectedRequest.comments || []).length === 0 && (
                      <div className="text-gray-400 text-sm">
                        No comments yet
                      </div>
                    )}
                    {(selectedRequest.comments || []).map((c) => (
                      <div key={c.id} className="text-sm">
                        <span className="font-semibold">
                          {c.author?.name || c.authorId}
                        </span>
                        <span className="text-gray-400 text-xs ml-2">
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                        <div>{c.body}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      className="flex-1 border rounded px-3 py-2 text-sm"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                    />
                    <Button
                      type="PRIMARY"
                      extraClasses="px-3 py-2 text-sm"
                      onClick={addComment}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Purpose View Modal */}
      {showPurposeModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setShowPurposeModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setShowPurposeModal(false)}
            >
              <span className="text-2xl">&times;</span>
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Purpose
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-wrap">
                {selectedPurpose}
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                type="SECONDARY"
                extraClasses="px-4 py-2"
                onClick={() => setShowPurposeModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comment View Modal */}
      {showCommentModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setShowCommentModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setShowCommentModal(false)}
            >
              <span className="text-2xl">&times;</span>
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Comment
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-wrap">
                {selectedComment}
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                type="SECONDARY"
                extraClasses="px-4 py-2"
                onClick={() => setShowCommentModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
