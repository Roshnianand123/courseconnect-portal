'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
        fetch('/api/courses', { cache: 'no-store' }),
        fetch('/api/students', { cache: 'no-store' }),
        fetch('/api/registrations', { cache: 'no-store' }),
        fetch('/api/stats', { cache: 'no-store' })
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
      if (statsData.success && statsData.dbStatus) {
        setDbStatus(statsData.dbStatus);
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

  // Derive dashboard statistics directly from active data (Single Source of Truth)
  const dashboardStats = useMemo(() => {
    const totalCourses = courses.length;
    const totalStudents = students.length;
    const totalRegistrations = registrations.length;
    const totalCapacity = courses.reduce((sum, c) => sum + (c.Capacity || 30), 0);
    const fillRate = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;

    return {
      totalCourses,
      totalStudents,
      totalRegistrations,
      fillRate: `${fillRate}%`
    };
  }, [courses, students, registrations]);

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
    // Immediately update registrations from source of truth
    setRegistrations((prev) => {
      if (prev.some((r) => r.RegistrationID === registration.RegistrationID)) return prev;
      return [registration, ...prev];
    });

    // Update course enrollment count & seats
    setCourses((prev) =>
      prev.map((c) => {
        if (c.CourseID.toUpperCase() === (registration.CourseID || '').toUpperCase()) {
          const enrolled = (c.EnrolledCount || 0) + 1;
          const capacity = c.Capacity || 30;
          return {
            ...c,
            EnrolledCount: enrolled,
            SeatsLeft: Math.max(0, capacity - enrolled)
          };
        }
        return c;
      })
    );

    // Update student's enrolled courses count
    setStudents((prev) =>
      prev.map((s) => {
        if (s.StudentID.toUpperCase() === (registration.StudentID || '').toUpperCase()) {
          return {
            ...s,
            EnrolledCount: (s.EnrolledCount || 0) + 1
          };
        }
        return s;
      })
    );

    fetchPortalData(true);
    addToast({
      type: 'success',
      title: 'Registration Successful!',
      message: `Enrolled successfully in course ${registration.CourseID || ''}.`
    });
  };

  // Callback on student added
  const handleStudentAdded = async (newStudent) => {
    setStudents((prev) => {
      const exists = prev.some(
        (s) => s.StudentID.toUpperCase() === newStudent.StudentID.toUpperCase()
      );
      if (exists) return prev;
      return [...prev, { ...newStudent, EnrolledCount: 0 }];
    });

    await fetchPortalData(true);

    addToast({
      type: 'success',
      title: 'Student Registered Successfully!',
      message: `${newStudent.Name} (${newStudent.StudentID}) has been added to the directory.`
    });
  };

  // Callback to delete registration
  const handleDeleteRegistration = async (registrationId) => {
    try {
      const regToRemove = registrations.find((r) => r.RegistrationID === registrationId);

      const res = await fetch(`/api/registrations/${registrationId}`, {
        method: 'DELETE',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to remove registration');
      }

      // Immediately remove registration from active state
      setRegistrations((prev) => prev.filter((r) => r.RegistrationID !== registrationId));

      // Update course seats and enrollment counts
      if (regToRemove) {
        setCourses((prev) =>
          prev.map((c) => {
            if (c.CourseID.toUpperCase() === (regToRemove.CourseID || '').toUpperCase()) {
              const enrolled = Math.max(0, (c.EnrolledCount || 0) - 1);
              const capacity = c.Capacity || 30;
              return {
                ...c,
                EnrolledCount: enrolled,
                SeatsLeft: Math.max(0, capacity - enrolled)
              };
            }
            return c;
          })
        );

        setStudents((prev) =>
          prev.map((s) => {
            if (s.StudentID.toUpperCase() === (regToRemove.StudentID || '').toUpperCase()) {
              return {
                ...s,
                EnrolledCount: Math.max(0, (s.EnrolledCount || 0) - 1)
              };
            }
            return s;
          })
        );
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

      {/* Metric Cards Banner - Derived from Single Source of Truth */}
      <StatsOverview
        stats={dashboardStats}
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
        existingStudents={students}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </>
  );
}
