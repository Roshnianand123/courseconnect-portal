'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import StatsOverview from '@/components/StatsOverview';
import CourseList from '@/components/CourseList';
import StudentDirectory from '@/components/StudentDirectory';
import RegistrationList from '@/components/RegistrationList';
import RegistrationModal from '@/components/RegistrationModal';
import AddStudentModal from '@/components/AddStudentModal';
import ToastContainer from '@/components/Toast';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function HomePage() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState('courses');

  // Application data state
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter pass-through state
  const [filterStudentId, setFilterStudentId] = useState('ALL');
  const [filterCourseId, setFilterCourseId] = useState('ALL');

  // Modal dialog states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [preselectedCourse, setPreselectedCourse] = useState(null);
  const [preselectedStudent, setPreselectedStudent] = useState(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, ...toast };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch all portal data
  const fetchPortalData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);

    try {
      const [coursesRes, studentsRes, registrationsRes, statsRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/students'),
        fetch('/api/registrations'),
        fetch('/api/stats')
      ]);

      const [coursesData, studentsData, registrationsData, statsData] = await Promise.all([
        coursesRes.json(),
        studentsRes.json(),
        registrationsRes.json(),
        statsRes.json()
      ]);

      if (coursesData.success) setCourses(coursesData.courses || []);
      if (studentsData.success) setStudents(studentsData.students || []);
      if (registrationsData.success) setRegistrations(registrationsData.registrations || []);
      if (statsData.success) {
        setStats(statsData.stats);
        if (statsData.dbStatus) setDbStatus(statsData.dbStatus);
      }
    } catch (err) {
      console.error('Portal load error:', err);
      setError('Unable to synchronize data with the server. Please check your connection.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortalData();
  }, [fetchPortalData]);

  // Modal Open Handlers
  const handleOpenRegister = (course = null, student = null) => {
    setPreselectedCourse(course || null);
    setPreselectedStudent(student || null);
    setIsRegisterOpen(true);
  };

  const handleOpenAddStudent = () => {
    setIsAddStudentOpen(true);
  };

  // Callback on successful registration
  const handleRegisterSuccess = (registration) => {
    fetchPortalData(true);
    addToast({
      type: 'success',
      title: 'Registration Successful!',
      message: `Enrolled successfully in course ${registration.CourseID || ''}.`
    });
  };

  // Callback on student added
  const handleStudentAdded = (student) => {
    fetchPortalData(true);
    addToast({
      type: 'success',
      title: 'Student Profile Created',
      message: `${student.Name} (${student.StudentID}) has been added to the directory.`
    });
  };

  // Callback to delete registration
  const handleDeleteRegistration = async (registrationId) => {
    try {
      const res = await fetch(`/api/registrations/${registrationId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to remove registration');
      }

      await fetchPortalData(true);
      addToast({
        type: 'info',
        title: 'Registration Removed',
        message: `Registration #${registrationId} has been successfully dropped.`
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Removal Failed',
        message: err.message
      });
      throw err;
    }
  };

  // Cross-view quick jump (e.g. click student in directory to filter registrations)
  const handleFilterByStudent = (studentId) => {
    setFilterStudentId(studentId);
    setActiveTab('registrations');
  };

  return (
    <>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRegister={() => handleOpenRegister()}
        onOpenAddStudent={handleOpenAddStudent}
        dbStatus={dbStatus}
      />

      {/* Metric Cards Banner */}
      <StatsOverview
        stats={stats}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setFilterStudentId('ALL');
          setFilterCourseId('ALL');
        }}
      />

      {/* Main Content Sections */}
      {loading ? (
        <div className="glass-panel empty-state" style={{ minHeight: '350px' }}>
          <Loader2 size={36} className="spin" style={{ color: 'var(--primary)', animation: 'spin 1.2s linear infinite' }} />
          <h3 className="empty-state-title">Loading Portal Data...</h3>
          <p className="empty-state-desc">Synchronizing courses, students, and active registrations.</p>
          <style jsx>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : error ? (
        <div className="glass-panel empty-state">
          <AlertTriangle size={36} style={{ color: 'var(--accent-rose)' }} />
          <h3 className="empty-state-title">Connection Interruption</h3>
          <p className="empty-state-desc">{error}</p>
          <button className="btn btn-primary btn-sm" onClick={() => fetchPortalData()}>
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>
        </div>
      ) : (
        <div>
          {/* TAB 1: Available Courses */}
          {activeTab === 'courses' && (
            <CourseList
              courses={courses}
              onRegisterForCourse={(course) => handleOpenRegister(course, null)}
              onOpenAddCourse={() => {}}
            />
          )}

          {/* TAB 2: Student Directory */}
          {activeTab === 'students' && (
            <StudentDirectory
              students={students}
              onOpenAddStudent={handleOpenAddStudent}
              onRegisterStudent={(student) => handleOpenRegister(null, student)}
              onFilterByStudent={handleFilterByStudent}
            />
          )}

          {/* TAB 3: Course Registrations */}
          {activeTab === 'registrations' && (
            <RegistrationList
              registrations={registrations}
              courses={courses}
              students={students}
              onDeleteRegistration={handleDeleteRegistration}
              onOpenRegister={() => handleOpenRegister()}
              initialStudentFilter={filterStudentId}
              initialCourseFilter={filterCourseId}
            />
          )}
        </div>
      )}

      {/* Registration Modal Dialog */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => {
          setIsRegisterOpen(false);
          setPreselectedCourse(null);
          setPreselectedStudent(null);
        }}
        students={students}
        courses={courses}
        registrations={registrations}
        onRegisterSuccess={handleRegisterSuccess}
        preselectedCourse={preselectedCourse}
        preselectedStudent={preselectedStudent}
      />

      {/* Add Student Modal Dialog */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onStudentAdded={handleStudentAdded}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </>
  );
}
