import React, { useState, useEffect } from 'react';
import getApi from '../../helpers/API/getApi';
import postApi from '../../helpers/API/postApi';
import putApi from '../../helpers/API/putApi';
import deleteApi from '../../helpers/API/deleteApi';
import toast from 'react-hot-toast';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter and pagination state
  const [filters, setFilters] = useState({
    search: '',
    batchId: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [sortConfig, setSortConfig] = useState({
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  // const [showUploadTeachersModal, setShowUploadTeachersModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    batchId: '',
    status: 'ACTIVE'
  });

  // CSV Upload state
  const [csvFile, setCsvFile] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Teachers CSV Upload state
  // const [teacherCsvFile, setTeacherCsvFile] = useState(null);
  // const [teacherUploadResults, setTeacherUploadResults] = useState(null);
  // const [teacherUploading, setTeacherUploading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [filters, pagination.page, pagination.limit, sortConfig]);

  const fetchInitialData = async () => {
    try {
      const [batchesRes] = await Promise.all([
        getApi('/admin/batches')
      ]);
      
      if (batchesRes?.statusCode === 200) setBatches(batchesRes.data);
      
      await fetchStudents();
    } catch (err) {
      setError('Failed to load initial data');
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        batchId: filters.batchId,
        status: filters.status,
        sortBy: sortConfig.sortBy,
        sortOrder: sortConfig.sortOrder
      });

      const response = await getApi(`/admin/students?${params}`);
      if (response?.statusCode === 200) {
        setStudents(response.data.students);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSort = (field) => {
    setSortConfig(prev => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      email: '',
      password: '',
      batchId: '',
      status: 'ACTIVE'
    });
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      const response = await postApi('/admin/students', formData);
      if (response?.statusCode === 201) {
        toast.success('Student created successfully');
        setShowCreateModal(false);
        resetForm();
        fetchStudents();
      }
    } catch (err) {
      toast.error('Failed to create student');
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    try {
      const response = await putApi(`/admin/students/${selectedStudent.id}`, formData);
      if (response?.statusCode === 200) {
        toast.success('Student updated successfully');
        setShowEditModal(false);
        setSelectedStudent(null);
        resetForm();
        fetchStudents();
      }
    } catch (err) {
      toast.error('Failed to update student');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    try {
      const response = await deleteApi(`/admin/students/${studentId}`);
      if (response?.statusCode === 200) {
        toast.success('Student deleted successfully');
        fetchStudents();
      }
    } catch (err) {
      toast.error('Failed to delete student');
    }
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      id: student.id,
      name: student.name,
      email: student.email,
      password: '',
      batchId: student.batchId?.toString() || '',
      status: student.status
    });
    setShowEditModal(true);
  };

  const getFilteredBatches = () => batches;

  // CSV Upload functions
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  // const handleTeacherFileChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file && file.type === 'text/csv') {
  //     setTeacherCsvFile(file);
  //   } else {
  //     toast.error('Please select a valid CSV file');
  //   }
  // };

  const parseCSV = (text) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const students = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim());
        const student = {};
        
        headers.forEach((header, index) => {
          student[header] = values[index] || '';
        });
        
        students.push(student);
      }
    }

    return students;
  };

  const handleCSVUpload = async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file');
      return;
    }

    try {
      setUploading(true);
      const text = await csvFile.text();
      const students = parseCSV(text);

      if (students.length === 0) {
        toast.error('No valid student data found in CSV');
        return;
      }

      const response = await postApi('/admin/students/bulk', { students });
      if (response?.statusCode === 200) {
        setUploadResults(response.data);
        toast.success(`Bulk upload completed. ${response.data.success.length} students created, ${response.data.errors.length} errors.`);
        fetchStudents();
      }
    } catch (err) {
      toast.error('Failed to upload CSV');
    } finally {
      setUploading(false);
    }
  };

  // const handleTeacherCSVUpload = async () => {
  //   if (!teacherCsvFile) {
  //     toast.error('Please select a CSV file');
  //     return;
  //   }

  //   try {
  //     setTeacherUploading(true);
  //     const text = await teacherCsvFile.text();
  //     const teachers = parseCSV(text);

  //     if (teachers.length === 0) {
  //       toast.error('No valid teacher data found in CSV');
  //       return;
  //     }

  //     const response = await postApi('/admin/teachers/bulk', { teachers });
  //     if (response?.statusCode === 200) {
  //       setTeacherUploadResults(response.data);
  //       toast.success(`Bulk upload completed. ${response.data.success.length} teachers created, ${response.data.errors.length} errors.`);
  //     }
  //   } catch (err) {
  //     toast.error('Failed to upload CSV');
  //   } finally {
  //     setTeacherUploading(false);
  //   }
  // };

  const downloadTemplate = () => {
    const template = `id,name,email,password,batchname
STUDENT001,John Doe,john@example.com,password123,2024
STUDENT002,Jane Smith,jane@example.com,password123,2025

Note: Batch will be auto-created if it doesn't exist (case-insensitive).`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadTeacherTemplate = () => {
    const template = `id,name,email,password
TEACHER001,Prof. Alpha,alpha@example.com,password123
TEACHER002,Prof. Beta,beta@example.com,password123`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teachers_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500 text-lg">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
            <p className="text-gray-600 mt-2">Manage students and batches</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-green text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Upload Students CSV
            </button>
            {/* <button
              onClick={() => setShowUploadTeachersModal(true)}
              className="px-4 py-2 bg-green text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Upload Teachers CSV
            </button> */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Student
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by name, email, or ID"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
            <select
              value={filters.batchId}
              onChange={(e) => handleFilterChange('batchId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Batches</option>
              {getFilteredBatches().map(batch => (
                <option key={batch.id} value={batch.id}>{batch.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({ search: '', batchId: '', status: '' });
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Students ({pagination.total})
            </h3>
            <div className="flex items-center space-x-4">
              <select
                value={pagination.limit}
                onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading students...</div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('id')}
                    >
                      ID
                      {sortConfig.sortBy === 'id' && (
                        <span className="ml-1">{sortConfig.sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      Name
                      {sortConfig.sortBy === 'name' && (
                        <span className="ml-1">{sortConfig.sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('email')}
                    >
                      Email
                      {sortConfig.sortBy === 'email' && (
                        <span className="ml-1">{sortConfig.sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch
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
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        No students found
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.email}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.batch?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            student.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(student)}
                              className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 border border-blue-300 rounded hover:bg-blue-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="text-red-600 hover:text-red-900 text-xs px-2 py-1 border border-red-300 rounded hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Student Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Student</h2>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Student ID</label>
                <input
                  type="text"
                  required
                  value={formData.id}
                  onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Batch</label>
                <select
                  value={formData.batchId}
                  onChange={(e) => setFormData(prev => ({ ...prev, batchId: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Batch</option>
                  {getFilteredBatches().map(batch => (
                    <option key={batch.id} value={batch.id}>{batch.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Create Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teachers CSV Upload Modal */}
      {/* {showUploadTeachersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Upload Teachers CSV</h2>

            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-800 mb-2">CSV Format Requirements:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Required columns: id, name, email, password</li>
                  <li>• First row should be headers</li>
                </ul>
              </div>

              <button
                onClick={downloadTeacherTemplate}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Download CSV Template
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select CSV File</label>
                <button
                  type="button"
                  onClick={() => document.getElementById('teacher-csv-file-input').click()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {teacherCsvFile ? `Selected: ${teacherCsvFile.name}` : 'Choose CSV File'}
                </button>
                <input
                  id="teacher-csv-file-input"
                  type="file"
                  accept=".csv"
                  onChange={handleTeacherFileChange}
                  className="hidden"
                />
              </div>

              {teacherUploadResults && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Upload Results:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <div className="text-green-800 font-semibold">Success: {teacherUploadResults.success.length}</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <div className="text-red-800 font-semibold">Errors: {teacherUploadResults.errors.length}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                {teacherCsvFile && (
                  <button
                    onClick={handleTeacherCSVUpload}
                    disabled={teacherUploading}
                    className="flex-1 px-4 py-2 bg-green text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {teacherUploading ? 'Uploading...' : 'Upload CSV'}
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowUploadTeachersModal(false);
                    setTeacherCsvFile(null);
                    setTeacherUploadResults(null);
                  }}
                  className={`px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 ${teacherCsvFile ? 'flex-1' : 'w-full'}`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Edit Student Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Edit Student</h2>
            <form onSubmit={handleEditStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Student ID</label>
                <input
                  type="text"
                  disabled
                  value={formData.id}
                  className="w-full px-3 py-2 border rounded-md bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Batch</label>
                <select
                  value={formData.batchId}
                  onChange={(e) => setFormData(prev => ({ ...prev, batchId: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Batch</option>
                  {getFilteredBatches().map(batch => (
                    <option key={batch.id} value={batch.id}>{batch.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Update Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedStudent(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Upload Students CSV</h2>
            
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-800 mb-2">CSV Format Requirements:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Required columns: id, name, email, password</li>
                  <li>• Optional columns: batchname</li>
                  <li>• Batch will be auto-created if it doesn't exist (case-insensitive)</li>
                  <li>• First row should be headers</li>
                </ul>
              </div>
              
              <button
                onClick={downloadTemplate}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Download CSV Template
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select CSV File</label>
                <button
                  type="button"
                  onClick={() => document.getElementById('csv-file-input').click()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {csvFile ? `Selected: ${csvFile.name}` : 'Choose CSV File'}
                </button>
                <input
                  id="csv-file-input"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-sm text-gray-500">
                  <span className="text-red-500">*</span> Required fields
                </p>
              </div>

              {csvFile && (
                <div className="text-sm text-gray-600">
                  Selected file: {csvFile.name}
                </div>
              )}

              {uploadResults && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Upload Results:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <div className="text-green-800 font-semibold">Success: {uploadResults.success.length}</div>
                      {uploadResults.success.length > 0 && (
                        <div className="text-sm text-green-700 mt-1">
                          {uploadResults.success.slice(0, 3).map(item => (
                            <div key={item.row}>Row {item.row}: {item.student.name}</div>
                          ))}
                          {uploadResults.success.length > 3 && (
                            <div className="text-xs">... and {uploadResults.success.length - 3} more</div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <div className="text-red-800 font-semibold">Errors: {uploadResults.errors.length}</div>
                      {uploadResults.errors.length > 0 && (
                        <div className="text-sm text-red-700 mt-1">
                          {uploadResults.errors.slice(0, 3).map(item => (
                            <div key={item.row}>Row {item.row}: {item.error}</div>
                          ))}
                          {uploadResults.errors.length > 3 && (
                            <div className="text-xs">... and {uploadResults.errors.length - 3} more</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                {csvFile && (
                  <button
                    onClick={handleCSVUpload}
                    disabled={uploading}
                    className="flex-1 px-4 py-2 bg-green text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Uploading...' : 'Upload Students CSV'}
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setCsvFile(null);
                    setUploadResults(null);
                  }}
                  className={`px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 ${csvFile ? 'flex-1' : 'w-full'}`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;
