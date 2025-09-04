import React, { useState, useEffect } from 'react';
import postApi from '../../helpers/API/postApi';
import getApi from '../../helpers/API/getApi';
import toast from 'react-hot-toast';

const FirstTimeLoginForm = ({ onProfileComplete }) => {
  const [formData, setFormData] = useState({
    // Personal Information
    studentId: '',
    studentFullName: '',
    emailId: '',
    admissionMonth: 'January',
    admissionYear: 2023,
    candidateMobile: '',
    parentMobile: '',
    
    // Bond and Placement
    bondPeriodCompleted: false,
    placementThroughCDPC: false,
    
    // Letter Head
    letterHeadCount: 1,
    
    // Faculty Selection
    facultySelection: '',
    
    // Semester Results (8 semesters)
    semesterResults: Array.from({ length: 8 }, (_, i) => ({
      semester: i + 1,
      attendance: '',
      cgpa: ''
    })),
    
    // University Preferences
    universityPreferences: [],
    
    // Competitive Exams
    competitiveExams: []
  });

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedExam, setSelectedExam] = useState('');
  const [examScore, setExamScore] = useState('');
  const [examFile, setExamFile] = useState(null);
  const [facultyMembers, setFacultyMembers] = useState([]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  // Fetch faculty members on component mount
  useEffect(() => {
    fetchFacultyMembers();
  }, []);

  const fetchFacultyMembers = async () => {
    try {
      const response = await getApi('/lor/teachers');
      if (response?.statusCode === 200) {
        setFacultyMembers(response.data || []);
      } else {
        console.error('Failed to fetch faculty members:', response);
        // Fallback to some default options if API fails
        setFacultyMembers([
          { id: 'faculty1', name: 'Dr. John Doe', department: 'Computer Science' },
          { id: 'faculty2', name: 'Dr. Jane Smith', department: 'Mathematics' },
          { id: 'faculty3', name: 'Dr. Mike Johnson', department: 'Physics' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching faculty members:', error);
      // Fallback options
      setFacultyMembers([
        { id: 'faculty1', name: 'Dr. John Doe', department: 'Computer Science' },
        { id: 'faculty2', name: 'Dr. Jane Smith', department: 'Mathematics' },
        { id: 'faculty3', name: 'Dr. Mike Johnson', department: 'Physics' }
      ]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSemesterChange = (semesterIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      semesterResults: prev.semesterResults.map((result, index) =>
        index === semesterIndex ? { ...result, [field]: value } : result
      )
    }));
  };

  const addUniversity = () => {
    setFormData(prev => ({
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
    setFormData(prev => ({
      ...prev,
      universityPreferences: prev.universityPreferences.map((pref, i) =>
        i === index ? { ...pref, [field]: value } : pref
      )
    }));
  };

  const removeUniversity = (index) => {
    setFormData(prev => ({
      ...prev,
      universityPreferences: prev.universityPreferences.filter((_, i) => i !== index)
    }));
  };

  const addCompetitiveExam = () => {
    if (!selectedExam.trim()) {
      toast.error('Please select an exam');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      competitiveExams: [
        ...prev.competitiveExams,
        {
          examName: selectedExam,
          score: examScore,
          scorecardFile: examFile ? examFile.name : null
        }
      ]
    }));
    
    setSelectedExam('');
    setExamScore('');
    setExamFile(null);
  };

  const removeCompetitiveExam = (index) => {
    setFormData(prev => ({
      ...prev,
      competitiveExams: prev.competitiveExams.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.studentId || !formData.studentFullName || !formData.emailId) {
      toast.error('Please fill in all required personal information fields');
      return;
    }
    
    if (!formData.facultySelection) {
      toast.error('Please select a faculty member');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await postApi('/students/profile', formData);
      
      if (response?.statusCode === 201) {
        toast.success('Profile created successfully!');
        onProfileComplete(response.data);
      } else {
        toast.error(response?.message || 'Failed to create profile');
      }
    } catch (error) {
      console.error('Profile creation error:', error);
      toast.error('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            REQUEST FOR LETTER OF RECOMMENDATION / FURTHER STUDY
          </h1>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map(step => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Personal Info</span>
              <span>Academic Details</span>
              <span>Preferences</span>
              <span>Review & Submit</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => handleInputChange('studentId', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student Full Name</label>
                    <input
                      type="text"
                      value={formData.studentFullName}
                      onChange={(e) => handleInputChange('studentFullName', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email-ID</label>
                    <input
                      type="email"
                      value={formData.emailId}
                      onChange={(e) => handleInputChange('emailId', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year/Date of Admission</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={formData.admissionMonth}
                        onChange={(e) => handleInputChange('admissionMonth', e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {months.map(month => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </select>
                      <select
                        value={formData.admissionYear}
                        onChange={(e) => handleInputChange('admissionYear', parseInt(e.target.value))}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Candidate Mobile</label>
                    <input
                      type="tel"
                      value={formData.candidateMobile}
                      onChange={(e) => handleInputChange('candidateMobile', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parent Mobile</label>
                    <input
                      type="tel"
                      value={formData.parentMobile}
                      onChange={(e) => handleInputChange('parentMobile', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bond period completed</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={formData.bondPeriodCompleted === false}
                          onChange={() => handleInputChange('bondPeriodCompleted', false)}
                          className="mr-2"
                        />
                        No
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={formData.bondPeriodCompleted === true}
                          onChange={() => handleInputChange('bondPeriodCompleted', true)}
                          className="mr-2"
                        />
                        Yes
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Place through CDPC, CHARUSAT</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={formData.placementThroughCDPC === false}
                          onChange={() => handleInputChange('placementThroughCDPC', false)}
                          className="mr-2"
                        />
                        No
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={formData.placementThroughCDPC === true}
                          onChange={() => handleInputChange('placementThroughCDPC', true)}
                          className="mr-2"
                        />
                        Yes
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Academic Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">Result Details</h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Semester</th>
                        {formData.semesterResults.map((_, index) => (
                          <th key={index} className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">
                            {index + 1}{getOrdinalSuffix(index + 1)} Sem
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">Attendance (%)</td>
                        {formData.semesterResults.map((result, index) => (
                          <td key={index} className="border border-gray-300 px-2 py-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={result.attendance}
                              onChange={(e) => handleSemesterChange(index, 'attendance', parseFloat(e.target.value) || '')}
                              className="w-full border-0 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0.00"
                            />
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">CGPA</td>
                        {formData.semesterResults.map((result, index) => (
                          <td key={index} className="border border-gray-300 px-2 py-2">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              step="0.01"
                              value={result.cgpa}
                              onChange={(e) => handleSemesterChange(index, 'cgpa', parseFloat(e.target.value) || '')}
                              className="w-full border-0 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0.00"
                            />
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">Competitive Exam Detail</h3>
                  <div className="bg-yellow-100 border border-yellow-400 p-4 rounded-md">
                    <p className="text-yellow-800 text-sm">
                      Kindly take Screenshot of Scorecard using snipping tool and use MS Word to convert into PDF
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Exam to Add</label>
                    <div className="flex space-x-2">
                      <select
                        value={selectedExam}
                        onChange={(e) => setSelectedExam(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Choose an exam...</option>
                        <option value="GRE">GRE</option>
                        <option value="TOEFL">TOEFL</option>
                        <option value="IELTS">IELTS</option>
                        <option value="CAT">CAT</option>
                        <option value="GATE">GATE</option>
                        <option value="Other">Other</option>
                      </select>
                      <input
                        type="text"
                        value={examScore}
                        onChange={(e) => setExamScore(e.target.value)}
                        placeholder="Score"
                        className="w-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="file"
                        onChange={(e) => setExamFile(e.target.files[0])}
                        accept=".pdf,.doc,.docx"
                        className="w-40 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={addCompetitiveExam}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {formData.competitiveExams.length > 0 ? (
                    <div className="space-y-2">
                      {formData.competitiveExams.map((exam, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                          <span className="text-sm">
                            <strong>{exam.examName}</strong>
                            {exam.score && ` - ${exam.score}`}
                            {exam.scorecardFile && ` (${exam.scorecardFile})`}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeCompetitiveExam(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No exams selected. Use the dropdown above to add exam scores.</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Preferences */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">Letter head for LOR</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">No. of Letter Head</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.letterHeadCount}
                    onChange={(e) => handleInputChange('letterHeadCount', parseInt(e.target.value) || 1)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">University Preference List</h3>
                  <button
                    type="button"
                    onClick={addUniversity}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Add University
                  </button>
                  
                  {formData.universityPreferences.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">University Name</th>
                            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Course Name</th>
                            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Country Name</th>
                            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Intake (Month - Year)</th>
                            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.universityPreferences.map((pref, index) => (
                            <tr key={index}>
                              <td className="border border-gray-300 px-2 py-2">
                                <input
                                  type="text"
                                  value={pref.universityName}
                                  onChange={(e) => updateUniversity(index, 'universityName', e.target.value)}
                                  placeholder="Enter university name"
                                  className="w-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                              <td className="border border-gray-300 px-2 py-2">
                                <input
                                  type="text"
                                  value={pref.courseName}
                                  onChange={(e) => updateUniversity(index, 'courseName', e.target.value)}
                                  placeholder="Enter course name"
                                  className="w-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                              <td className="border border-gray-300 px-2 py-2">
                                <input
                                  type="text"
                                  value={pref.countryName}
                                  onChange={(e) => updateUniversity(index, 'countryName', e.target.value)}
                                  placeholder="Enter country"
                                  className="w-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                              <td className="border border-gray-300 px-2 py-2">
                                <div className="grid grid-cols-2 gap-1">
                                  <input
                                    type="text"
                                    value={pref.intakeMonth}
                                    onChange={(e) => updateUniversity(index, 'intakeMonth', e.target.value)}
                                    placeholder="e.g. Sep"
                                    className="w-full border-0 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                  <input
                                    type="number"
                                    value={pref.intakeYear}
                                    onChange={(e) => updateUniversity(index, 'intakeYear', parseInt(e.target.value) || new Date().getFullYear())}
                                    placeholder="2024"
                                    className="w-full border-0 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </td>
                              <td className="border border-gray-300 px-2 py-2">
                                <button
                                  type="button"
                                  onClick={() => removeUniversity(index)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">Faculty Selection</h3>
                  <p className="text-red-600 text-sm">[Choose a faculty member for your LOR request]</p>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Faculty</label>
                    <select
                      value={formData.facultySelection}
                      onChange={(e) => handleInputChange('facultySelection', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">-- Select a Faculty Member --</option>
                      {facultyMembers.map(faculty => (
                        <option key={faculty.id} value={faculty.id}>{faculty.name} - {faculty.department}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review and Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">Review Your Information</h2>
                
                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Student ID:</strong> {formData.studentId}</div>
                      <div><strong>Full Name:</strong> {formData.studentFullName}</div>
                      <div><strong>Email:</strong> {formData.emailId}</div>
                      <div><strong>Admission:</strong> {formData.admissionMonth} {formData.admissionYear}</div>
                      <div><strong>Mobile:</strong> {formData.candidateMobile}</div>
                      <div><strong>Parent Mobile:</strong> {formData.parentMobile}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Academic Details</h3>
                    <div className="text-sm">
                      <div><strong>Bond Period Completed:</strong> {formData.bondPeriodCompleted ? 'Yes' : 'No'}</div>
                      <div><strong>Placement through CDPC:</strong> {formData.placementThroughCDPC ? 'Yes' : 'No'}</div>
                      <div><strong>Faculty Selected:</strong> {
                        facultyMembers.find(f => f.id === formData.facultySelection)?.name || formData.facultySelection
                      }</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">University Preferences</h3>
                    <div className="text-sm">
                      {formData.universityPreferences.length > 0 ? (
                        formData.universityPreferences.map((pref, index) => (
                          <div key={index} className="mb-2">
                            {pref.universityName} - {pref.courseName} ({pref.countryName}) - {pref.intakeMonth} {pref.intakeYear}
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500">No university preferences added</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Competitive Exams</h3>
                    <div className="text-sm">
                      {formData.competitiveExams.length > 0 ? (
                        formData.competitiveExams.map((exam, index) => (
                          <div key={index} className="mb-2">
                            {exam.examName} - {exam.score} {exam.scorecardFile && `(${exam.scorecardFile})`}
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500">No competitive exams added</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="declaration"
                      className="mt-1"
                      required
                    />
                    <label htmlFor="declaration" className="text-sm text-gray-700">
                      I hereby declare that the details furnished above are true and correct to the best of my knowledge.
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex space-x-4">
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-2 bg-green text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
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

export default FirstTimeLoginForm;

