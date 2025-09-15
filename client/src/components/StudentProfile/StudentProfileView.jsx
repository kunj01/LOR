import React, { useState, useEffect } from 'react';
import getApi from '../../helpers/API/getApi';
import putApi from '../../helpers/API/putApi';
import toast from 'react-hot-toast';

const StudentProfileView = ({ onEditMode, isEditMode, profileData, onProfileUpdate }) => {
  const [profile, setProfile] = useState(profileData || {});
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (profileData) {
      setProfile(profileData);
      setEditData(profileData);
    }
  }, [profileData]);

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSemesterChange = (semesterIndex, field, value) => {
    setEditData(prev => ({
      ...prev,
      semesterResults: prev.semesterResults.map((result, index) =>
        index === semesterIndex ? { ...result, [field]: value } : result
      )
    }));
  };

  const addUniversity = () => {
    setEditData(prev => ({
      ...prev,
      universityPreferences: [
        ...prev.universityPreferences,
        {
          universityName: '',
          courseName: '',
          countryName: '',
          intakeMonth: '',
          intakeYear: new Date().getFullYear()
        }
      ]
    }));
  };

  const updateUniversity = (index, field, value) => {
    setEditData(prev => ({
      ...prev,
      universityPreferences: prev.universityPreferences.map((pref, i) =>
        i === index ? { ...pref, [field]: value } : pref
      )
    }));
  };

  const removeUniversity = (index) => {
    setEditData(prev => ({
      ...prev,
      universityPreferences: prev.universityPreferences.filter((_, i) => i !== index)
    }));
  };

  const addCompetitiveExam = () => {
    setEditData(prev => ({
      ...prev,
      competitiveExams: [
        ...prev.competitiveExams,
        {
          examName: '',
          score: '',
          scorecardFile: null
        }
      ]
    }));
  };

  const updateCompetitiveExam = (index, field, value) => {
    setEditData(prev => ({
      ...prev,
      competitiveExams: prev.competitiveExams.map((exam, i) =>
        i === index ? { ...exam, [field]: value } : exam
      )
    }));
  };

  const removeCompetitiveExam = (index) => {
    setEditData(prev => ({
      ...prev,
      competitiveExams: prev.competitiveExams.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await putApi('/students/profile', editData);
      
      if (response?.statusCode === 200) {
        toast.success('Profile updated successfully!');
        setProfile(response.data);
        onProfileUpdate(response.data);
        onEditMode(false);
      } else {
        toast.error(response?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(profile);
    onEditMode(false);
  };

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No profile data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Student Profile</h2>
        {!isEditMode && (
          <button
            onClick={() => onEditMode(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Edit Profile
          </button>
        )}
      </div>

      {isEditMode ? (
        <div className="space-y-6">
          {/* Edit Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
              <input
                type="text"
                value={editData.studentId || ''}
                onChange={(e) => handleInputChange('studentId', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={editData.studentFullName || ''}
                onChange={(e) => handleInputChange('studentFullName', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={editData.emailId || ''}
                onChange={(e) => handleInputChange('emailId', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
              <input
                type="tel"
                value={editData.candidateMobile || ''}
                onChange={(e) => handleInputChange('candidateMobile', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Semester Results */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Semester Results</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Semester</th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">Attendance (%)</th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">CGPA</th>
                  </tr>
                </thead>
                <tbody>
                  {(editData.semesterResults || []).map((result, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
                        {index + 1}{getOrdinalSuffix(index + 1)} Semester
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={result.attendance || ''}
                          onChange={(e) => handleSemesterChange(index, 'attendance', parseFloat(e.target.value) || '')}
                          className="w-full border-0 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.01"
                          value={result.cgpa || ''}
                          onChange={(e) => handleSemesterChange(index, 'cgpa', parseFloat(e.target.value) || '')}
                          className="w-full border-0 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* University Preferences */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">University Preferences</h3>
            <button
              type="button"
              onClick={addUniversity}
              className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Add University
            </button>
            
            {(editData.universityPreferences || []).map((pref, index) => (
              <div key={index} className="border border-gray-300 rounded-md p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">University Name</label>
                    <input
                      type="text"
                      value={pref.universityName || ''}
                      onChange={(e) => updateUniversity(index, 'universityName', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                    <input
                      type="text"
                      value={pref.courseName || ''}
                      onChange={(e) => updateUniversity(index, 'courseName', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={pref.countryName || ''}
                      onChange={(e) => updateUniversity(index, 'countryName', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Intake</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={pref.intakeMonth || ''}
                        onChange={(e) => updateUniversity(index, 'intakeMonth', e.target.value)}
                        placeholder="Month"
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={pref.intakeYear || ''}
                        onChange={(e) => updateUniversity(index, 'intakeYear', parseInt(e.target.value) || '')}
                        placeholder="Year"
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeUniversity(index)}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Competitive Exams */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Competitive Exams</h3>
            <button
              type="button"
              onClick={addCompetitiveExam}
              className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Add Exam
            </button>
            
            {(editData.competitiveExams || []).map((exam, index) => (
              <div key={index} className="border border-gray-300 rounded-md p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Exam Name</label>
                    <input
                      type="text"
                      value={exam.examName || ''}
                      onChange={(e) => updateCompetitiveExam(index, 'examName', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Score</label>
                    <input
                      type="text"
                      value={exam.score || ''}
                      onChange={(e) => updateCompetitiveExam(index, 'score', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scorecard File</label>
                    <input
                      type="file"
                      onChange={(e) => updateCompetitiveExam(index, 'scorecardFile', e.target.files[0]?.name || '')}
                      accept=".pdf,.doc,.docx"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeCompetitiveExam(index)}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* View Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Personal Information</h3>
              <div className="space-y-3">
                <div><strong>Student ID:</strong> {profile.studentId}</div>
                <div><strong>Full Name:</strong> {profile.studentFullName}</div>
                <div><strong>Email:</strong> {profile.emailId}</div>
                <div><strong>Admission:</strong> {profile.admissionMonth} {profile.admissionYear}</div>
                <div><strong>Mobile:</strong> {profile.candidateMobile}</div>
                <div><strong>Parent Mobile:</strong> {profile.parentMobile}</div>
                <div><strong>Bond Period Completed:</strong> {profile.bondPeriodCompleted ? 'Yes' : 'No'}</div>
                <div><strong>Placement through CDPC:</strong> {profile.placementThroughCDPC ? 'Yes' : 'No'}</div>
                <div><strong>Faculty Selected:</strong> {profile.facultySelection}</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Academic Details</h3>
              <div className="space-y-3">
                <div><strong>Profile Created:</strong> {new Date(profile.createdAt).toLocaleDateString()}</div>
                <div><strong>Last Updated:</strong> {new Date(profile.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Semester Results */}
          {profile.semesterResults && profile.semesterResults.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Semester Results</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Semester</th>
                      <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">Attendance (%)</th>
                      <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">CGPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.semesterResults.map((result, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
                          {result.semester}{getOrdinalSuffix(result.semester)} Semester
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                          {result.attendance || '-'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                          {result.cgpa || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* University Preferences */}
          {profile.universityPreferences && profile.universityPreferences.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">University Preferences</h3>
              <div className="space-y-3">
                {profile.universityPreferences.map((pref, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-3">
                    <div><strong>University:</strong> {pref.universityName}</div>
                    <div><strong>Course:</strong> {pref.courseName}</div>
                    <div><strong>Country:</strong> {pref.countryName}</div>
                    <div><strong>Intake:</strong> {pref.intakeMonth} {pref.intakeYear}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Competitive Exams */}
          {profile.competitiveExams && profile.competitiveExams.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Competitive Exams</h3>
              <div className="space-y-3">
                {profile.competitiveExams.map((exam, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-3">
                    <div><strong>Exam:</strong> {exam.examName}</div>
                    <div><strong>Score:</strong> {exam.score || 'Not provided'}</div>
                    {exam.scorecardFile && <div><strong>File:</strong> {exam.scorecardFile}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function for ordinal suffixes
const getOrdinalSuffix = (num) => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
};

export default StudentProfileView;

