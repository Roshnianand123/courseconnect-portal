'use client';

import React, { useState, useEffect } from 'react';
import { GraduationCap, Clock, AlertCircle, CheckCircle2, UserCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RegistrationModal({
  isOpen,
  onClose,
  students,
  courses,
  registrations,
  onRegisterSuccess,
  preselectedCourse = null,
  preselectedStudent = null
}) {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle preselected values when opening modal
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      const defaultCourse = preselectedCourse ? preselectedCourse.CourseID : (courses[0]?.CourseID || '');
      const defaultStudent = preselectedStudent ? preselectedStudent.StudentID : (students[0]?.StudentID || '');
      setSelectedCourseId(defaultCourse);
      setSelectedStudentId(defaultStudent);
    }
  }, [isOpen, preselectedCourse, preselectedStudent, courses, students]);

  if (!isOpen) return null;

  const activeCourse = courses.find(c => c.CourseID === selectedCourseId);
  const activeStudent = students.find(s => s.StudentID === selectedStudentId);

  // Check if student is already enrolled in selected course
  const isAlreadyEnrolled = registrations.some(
    r => r.StudentID === selectedStudentId && r.CourseID === selectedCourseId
  );

  const seatsLeft = activeCourse ? (activeCourse.SeatsLeft !== undefined ? activeCourse.SeatsLeft : Math.max(0, (activeCourse.Capacity || 30) - (activeCourse.EnrolledCount || 0))) : 0;
  const isFull = seatsLeft <= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedCourseId) {
      setErrorMessage('Please select both a student and a course.');
      return;
    }

    if (isAlreadyEnrolled) {
      setErrorMessage('Student is already registered for this course.');
      return;
    }

    if (isFull) {
      setErrorMessage('This course is already full.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          StudentID: selectedStudentId,
          CourseID: selectedCourseId
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete registration.');
      }

      // Trigger celebratory confetti effect
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Confetti optional
      }

      onRegisterSuccess(data.registration);
      onClose();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="register-modal-title">
      <div className="modal-dialog">
        <div className="modal-header">
          <h2 id="register-modal-title" className="modal-title">
            <GraduationCap size={22} style={{ color: 'var(--primary)' }} />
            <span>Course Registration</span>
          </h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Student Selector */}
            <div className="form-group">
              <label htmlFor="reg-student-select" className="form-label">
                <span>Select Student *</span>
                <span className="form-helper">{students.length} available</span>
              </label>
              <select
                id="reg-student-select"
                className="form-select"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
              >
                {students.map(s => (
                  <option key={s.StudentID} value={s.StudentID}>
                    {s.StudentID} - {s.Name} ({s.Email})
                  </option>
                ))}
              </select>
            </div>

            {/* Course Selector */}
            <div className="form-group">
              <label htmlFor="reg-course-select" className="form-label">
                <span>Select Course *</span>
                <span className="form-helper">{courses.length} available</span>
              </label>
              <select
                id="reg-course-select"
                className="form-select"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                required
              >
                {courses.map(c => (
                  <option key={c.CourseID} value={c.CourseID}>
                    {c.CourseID} - {c.CourseName} ({c.Duration})
                  </option>
                ))}
              </select>
            </div>

            {/* Course Details Card Preview */}
            {activeCourse && (
              <div
                style={{
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="course-id-badge">{activeCourse.CourseID}</span>
                  <span className={`seats-badge ${isFull ? 'full' : 'available'}`}>
                    {isFull ? 'Course Full' : `${seatsLeft} Seats Open`}
                  </span>
                </div>
                <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '1rem' }}>
                  {activeCourse.CourseName}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <Clock size={14} style={{ color: 'var(--accent-cyan)' }} />
                  <span>Duration: <strong>{activeCourse.Duration}</strong></span>
                  <span style={{ margin: '0 0.4rem' }}>•</span>
                  <span>Dept: {activeCourse.Department || 'Academic'}</span>
                </div>
              </div>
            )}

            {/* Validation Alerts */}
            {isAlreadyEnrolled && (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  color: '#fbbf24',
                  fontSize: '0.85rem'
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Already Enrolled:</strong> {activeStudent?.Name} is already registered for this course.
                </span>
              </div>
            )}

            {isFull && (
              <div
                style={{
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  color: '#f87171',
                  fontSize: '0.85rem'
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Full Course:</strong> All seats have been filled for this course.
                </span>
              </div>
            )}

            {errorMessage && (
              <div className="form-error" style={{ padding: '0.5rem 0' }}>
                {errorMessage}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              id="btn-submit-registration"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || isAlreadyEnrolled || isFull}
            >
              {isSubmitting ? (
                'Processing...'
              ) : (
                <>
                  <UserCheck size={16} />
                  <span>Confirm Registration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
