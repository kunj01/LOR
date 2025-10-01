import React, { useState, useEffect, useMemo } from "react";
import getApi from "../../helpers/API/getApi";
import patchApi from "../../helpers/API/patchApi";
import toast from "react-hot-toast";
import axios from "axios";
import apiInfo from "../../helpers/API/apiInfo";
import Tabs from "../../components/UI/Tabs";

const LORApplications = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reassignMap, setReassignMap] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [activeStatus, setActiveStatus] = useState(0);
  const [expandedMobile, setExpandedMobile] = useState({});

  useEffect(() => {
    fetchRequests();
    fetchTeachers();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getApi("/lor/admin/all");
      if (response?.statusCode === 200) {
        setRequests(response.data || []);
      } else {
        setError(response?.message || "Failed to fetch requests");
      }
    } catch (err) {
      setError("Error fetching requests");
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, status, comment = "") => {
    try {
      const res = await patchApi(`/lor/${requestId}/status`, {
        status,
        comment,
      });
      if (res?.statusCode === 200) {
        toast.success(`Request ${status.toLowerCase()}`);
        await fetchRequests();
      } else {
        toast.error(res?.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status");
    }
  };

  const fetchTeachers = async () => {
    try {
      // Fetch up to 1000 teachers for dropdown
      const res = await getApi(
        "/admin/teachers?page=1&limit=1000&sortBy=name&sortOrder=asc"
      );
      if (res?.statusCode === 200) {
        setTeachers(res.data.teachers || []);
      }
    } catch (err) {
      // Silent fail; dropdown will show empty
      console.error("Failed to load teachers", err);
    }
  };

  const handleReassign = async (requestId) => {
    const newTeacherId = reassignMap[requestId]?.trim();
    if (!newTeacherId) {
      toast.error("Please enter a teacher ID");
      return;
    }
    try {
      const res = await patchApi(`/lor/${requestId}/reassign`, {
        newTeacherId,
      });
      if (res?.statusCode === 200) {
        toast.success("Request reassigned");
        setReassignMap((prev) => ({ ...prev, [requestId]: "" }));
        await fetchRequests();
      } else {
        toast.error(res?.message || "Failed to reassign");
      }
    } catch (err) {
      console.error("Error reassigning request:", err);
      // toast handled by patchApi
    }
  };

  const handleExportCsv = async () => {
    try {
      const response = await axios.get(`${apiInfo.URL}/lor/admin/export/csv`, {
        responseType: "blob",
        withCredentials: true,
      });

      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "lor_requests.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export CSV failed:", err);
      toast.error(err?.response?.data?.message || "Failed to export CSV");
    }
  };

  const grouped = useMemo(() => {
    const byStatus = {
      ALL: requests,
      PENDING: requests.filter((r) => r.status === "PENDING"),
      APPROVED: requests.filter((r) => r.status === "APPROVED"),
      REJECTED: requests.filter((r) => r.status === "REJECTED"),
    };
    return byStatus;
  }, [requests]);

  const filteredRows = useMemo(
    () =>
      activeStatus === 0
        ? grouped.ALL
        : activeStatus === 1
        ? grouped.PENDING
        : activeStatus === 2
        ? grouped.APPROVED
        : grouped.REJECTED,
    [activeStatus, grouped]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading LOR requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">LOR Applications</h1>
        <p className="text-gray-600 mt-2">
          Monitor and manage all Letter of Recommendation requests
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">
              LOR Requests
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchRequests}
                className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={handleExportCsv}
                className="px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-6 pt-4">
          <Tabs
            initial={activeStatus}
            onChange={setActiveStatus}
            tabs={[
              { label: `All (${grouped.ALL.length})`, content: null },
              { label: `Pending (${grouped.PENDING.length})`, content: null },
              { label: `Approved (${grouped.APPROVED.length})`, content: null },
              { label: `Rejected (${grouped.REJECTED.length})`, content: null },
            ]}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Teacher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Docs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No LOR requests found
                  </td>
                </tr>
              ) : (
                filteredRows.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.studentId || request.student?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.student?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm font-medium text-gray-900">
                        {request.teacherId || request.teacher?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.teacher?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                      {request.purpose || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm hidden md:table-cell">
                      {request.documents && request.documents.length > 0 ? (
                        <div className="space-x-1">
                          {request.documents.map((doc, idx) => (
                            <a
                              key={doc.id}
                              className="text-blue-600 hover:underline"
                              href={`${apiInfo.URL}/uploads/${doc.filename}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {idx === 0 ? "View file" : `File ${idx + 1}`}
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
                            ? "bg-yellow-100 text-yellow-800"
                            : request.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="hidden md:block">
                        {request.status === "PENDING" ? (
                          <div className="flex flex-col space-y-2">
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  handleStatusUpdate(request.id, "APPROVED")
                                }
                                className="bg-green hover:text-white text-xs px-2 py-1 border border-green-300 rounded hover:bg-green-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(request.id, "REJECTED")
                                }
                                className="text-red-600 hover:text-red-900 text-xs px-2 py-1 border border-red-300 rounded hover:bg-red-50"
                              >
                                Reject
                              </button>
                            </div>
                            <div className="flex items-center space-x-2">
                              <select
                                className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
                                value={
                                  reassignMap[request.id] ??
                                  (request.teacher?.id ||
                                    request.teacherId ||
                                    "")
                                }
                                onChange={(e) =>
                                  setReassignMap((prev) => ({
                                    ...prev,
                                    [request.id]: e.target.value,
                                  }))
                                }
                              >
                                <option value="">Select teacher</option>
                                {teachers.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.id} - {t.name || t.email}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleReassign(request.id)}
                                className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 border border-blue-300 rounded hover:bg-blue-50"
                              >
                                Reassign
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            No actions available
                          </span>
                        )}
                      </div>
                      <div className="md:hidden">
                        <button
                          className="text-blue-600 text-xs underline"
                          onClick={() =>
                            setExpandedMobile((prev) => ({
                              ...prev,
                              [request.id]: !prev[request.id],
                            }))
                          }
                        >
                          {expandedMobile[request.id] ? "Hide" : "Details"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Mobile-only expanded details */}
        <div className="md:hidden px-4 pb-4">
          {filteredRows.map((request) =>
            expandedMobile[request.id] ? (
              <div
                key={`mobile-${request.id}`}
                className="border-t border-gray-200 py-3 text-sm text-gray-700 space-y-2"
              >
                <div>
                  <span className="text-gray-500">Teacher:</span>{" "}
                  {request.teacher?.name || request.teacherId}
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>{" "}
                  {request.teacher?.email || "-"}
                </div>
                <div>
                  <span className="text-gray-500">Purpose:</span>{" "}
                  {request.purpose || "-"}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-500">Docs:</span>
                  {request.documents?.length ? (
                    request.documents.map((doc, idx) => (
                      <a
                        key={doc.id}
                        className="text-blue-600 underline"
                        href={`${apiInfo.URL}/uploads/${doc.filename}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {idx === 0 ? "View file" : `File ${idx + 1}`}
                      </a>
                    ))
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </div>
                {request.status === "PENDING" ? (
                  <div className="pt-1 space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleStatusUpdate(request.id, "APPROVED")
                        }
                        className="bg-green hover:text-white text-xs px-2 py-1 border border-green-300 rounded hover:bg-green-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleStatusUpdate(request.id, "REJECTED")
                        }
                        className="text-red-600 hover:text-red-900 text-xs px-2 py-1 border border-red-300 rounded hover:bg-red-50"
                      >
                        Reject
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        className="border border-gray-300 rounded px-2 py-1 text-xs"
                        value={
                          reassignMap[request.id] ??
                          (request.teacher?.id || request.teacherId || "")
                        }
                        onChange={(e) =>
                          setReassignMap((prev) => ({
                            ...prev,
                            [request.id]: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select teacher</option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.id} - {t.name || t.email}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleReassign(request.id)}
                        className="text-blue-600 text-xs px-2 py-1 border border-blue-300 rounded"
                      >
                        Reassign
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-xs">
                    No actions available
                  </div>
                )}
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
};

export default LORApplications;
