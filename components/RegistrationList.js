'use client';

import React, { useState, useMemo } from 'react';
import { Search, Trash2, Calendar, BookOpen, User, AlertTriangle, ShieldCheck, Filter } from 'lucide-react';

export default function RegistrationList({
  registrations,
  courses,
  students,
  onDeleteRegistration,
  onOpenRegister,
  initialStudentFilter = 'ALL',
  initialCourseFilter = 'ALL'
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(initialCourseFilter);
  const [selectedStudent, setSelectedStudent] = useState(initialStudentFilter);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync if filter prop changes
  React.useEffect(() => {
    if (initialStudentFilter) setSelectedStudent(initialStudentFilter);
  }, [initialStudentFilter]);

  React.useEffect(() => {
    if (initialCourseFilter) setSelectedCourse(initialCourseFilter);
  }, [initialCourseFilter]);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      const matchCourse = selectedCourse === 'ALL' || r.CourseID === selectedCourse;
      const matchStudent = selectedStudent === 'ALL' || r.StudentID === selectedStudent;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        r.StudentName.toLowerCase().includes(q) ||
        r.StudentID.toLowerCase().includes(q) ||
        r.CourseName.toLowerCase().includes(q) ||
        r.CourseID.toLowerCase().includes(q) ||
        String(r.RegistrationID).includes(q);

      return matchCourse && matchStudent && matchQuery;
    });
  }, [registrations, searchQuery, selectedCourse, selectedStudent]);

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    try {
      await onDeleteRegistration(confirmDeleteId);
      setConfirmDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const regToDelete = registrations.find(r => r.RegistrationID === confirmDeleteId);

  return (
    <section aria-labelledby="registrations-heading">
      {/* Section Header */}
      <div className="section-header">
        <div className="section-title-wrap">
          <h1 id="registrations-heading" className="section-title">
            <span>Course Registrations</span>
            <span className="brand-badge">{registrations.length} Total</span>
          </h1>
          <p className="section-desc">
            Review active student enrollments, track course rosters, and drop registrations.
          </p>
        </div>

        {/* Toolbar with Multi-Filters & Enroll CTA */}
        <div className="section-toolbar">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" aria-hidden="true" />
            <input
              id="registration-search-input"
              type="text"
              className="input-field"
              placeholder="Search student, course, or reg ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search registrations"
            />
          </div>

          <select
            id="reg-course-filter"
            className="filter-select"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            aria-label="Filter by course"
          >
            <option value="ALL">All Courses</option>
            {courses.map(c => (
              <option key={c.CourseID} value={c.CourseID}>
                {c.CourseID} - {c.CourseName}
              </option>
            ))}
          </select>

          <select
            id="reg-student-filter"
            className="filter-select"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            aria-label="Filter by student"
          >
            <option value="ALL">All Students</option>
            {students.map(s => (
              <option key={s.StudentID} value={s.StudentID}>
                {s.StudentID} - {s.Name}
              </option>
            ))}
          </select>

          <button
            id="btn-register-action"
            className="btn btn-primary"
            onClick={onOpenRegister}
          >
            <BookOpen size={16} />
            <span>New Registration</span>
          </button>
        </div>
      </div>

      {/* Registrations Data Table */}
      {filteredRegistrations.length > 0 ? (
        <div className="table-container">
          <table className="custom-table" aria-label="Course Registrations Table">
            <thead>
              <tr>
                <th>Reg ID</th>
                <th>Student Details</th>
                <th>Course Details</th>
                <th>Duration</th>
                <th>Date Enrolled</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map((reg) => (
                <tr key={reg.RegistrationID} id={`reg-row-${reg.RegistrationID}`}>
                  <td>
                    <span className="course-id-badge">#{reg.RegistrationID}</span>
                  </td>
                  <td>
                    <div className="student-info-cell">
                      <div className="student-avatar" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' }}>
                        {reg.StudentName ? reg.StudentName.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div>
                        <div className="student-name-text">{reg.StudentName}</div>
                        <div className="student-email-text">{reg.StudentID} • {reg.StudentEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>{reg.CourseName}</div>
                      <span className="course-id-badge" style={{ marginTop: '0.25rem', display: 'inline-block' }}>
                        {reg.CourseID}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{reg.Duration}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      <Calendar size={13} style={{ color: 'var(--accent-violet)' }} />
                      <span>{new Date(reg.RegisteredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      id={`btn-remove-reg-${reg.RegistrationID}`}
                      className="btn btn-danger btn-sm"
                      onClick={() => setConfirmDeleteId(reg.RegistrationID)}
                      title={`Remove registration #${reg.RegistrationID}`}
                    >
                      <Trash2 size={13} />
                      <span>Drop</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-panel empty-state">
          <div className="empty-state-icon">
            <Filter size={32} />
          </div>
          <h3 className="empty-state-title">No Registrations Match Filter</h3>
          <p className="empty-state-desc">
            No course enrollments were found for the selected criteria. Clear filters or register a student.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => { setSearchQuery(''); setSelectedCourse('ALL'); setSelectedStudent('ALL'); }}
            >
              Reset Filters
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={onOpenRegister}
            >
              Register a Student
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Dropping a Registration */}
      {confirmDeleteId && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-delete-title">
          <div className="modal-dialog">
            <div className="modal-header">
              <h2 id="confirm-delete-title" className="modal-title" style={{ color: '#fca5a5' }}>
                <AlertTriangle size={20} />
                <span>Confirm Registration Removal</span>
              </h2>
              <button
                className="modal-close-btn"
                onClick={() => setConfirmDeleteId(null)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Are you sure you want to remove the registration for:
              </p>
              
              {regToDelete && (
                <div
                  style={{
                    background: 'rgba(244, 63, 94, 0.08)',
                    border: '1px solid rgba(244, 63, 94, 0.2)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#ffffff' }}>{regToDelete.StudentName} ({regToDelete.StudentID})</div>
                  <div style={{ fontSize: '0.85rem', color: '#fda4af', marginTop: '0.2rem' }}>
                    Course: {regToDelete.CourseName} ({regToDelete.CourseID})
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
                    Registration Record #{regToDelete.RegistrationID}
                  </div>
                </div>
              )}

              <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>
                This action will immediately release the seat back to the course availability pool.
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmDeleteId(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-reg"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Removing...' : 'Yes, Drop Registration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
