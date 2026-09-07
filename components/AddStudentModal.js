'use client';

import React, { useState } from 'react';
import { UserPlus, Mail, User, Hash, Check, AlertCircle } from 'lucide-react';

export default function AddStudentModal({
  isOpen,
  onClose,
  onStudentAdded,
  existingStudents = []
}) {
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setErrorMessage('');
    setStudentId('');
    setName('');
    setEmail('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedId = studentId.trim();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // 1. Validate Student ID
    if (!trimmedId) {
      setErrorMessage('Student ID is required and cannot be empty.');
      return;
    }

    // 2. Validate Name
    if (!trimmedName) {
      setErrorMessage('Student Name is required and cannot be empty.');
      return;
    }

    // 3. Validate Email Format
    if (!trimmedEmail) {
      setErrorMessage('Email address is required and cannot be empty.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email format (e.g. name@university.edu).');
      return;
    }

    // 4. Validate Duplicates (Client-side fast check)
    const duplicateId = existingStudents.find(
      s => (s.StudentID || s.studentid || '').trim().toUpperCase() === trimmedId.toUpperCase()
    );
    if (duplicateId) {
      setErrorMessage(`Student ID "${trimmedId}" is already registered (${duplicateId.Name || duplicateId.name}).`);
      return;
    }

    const duplicateEmail = existingStudents.find(
      s => (s.Email || s.email || '').trim().toLowerCase() === trimmedEmail.toLowerCase()
    );
    if (duplicateEmail) {
      setErrorMessage(`A student with email "${trimmedEmail}" already exists (${duplicateEmail.Name || duplicateEmail.name}).`);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          StudentID: trimmedId,
          Name: trimmedName,
          Email: trimmedEmail
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to register student in the database.');
      }

      onStudentAdded(data.student);
      setStudentId('');
      setName('');
      setEmail('');
      setErrorMessage('');
      onClose();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-student-title">
      <div className="modal-dialog">
        <div className="modal-header">
          <h2 id="add-student-title" className="modal-title">
            <UserPlus size={22} style={{ color: 'var(--primary)' }} />
            <span>Add / Register Student</span>
          </h2>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close dialog"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Field 1: Student ID */}
            <div className="form-group">
              <label htmlFor="student-id-input" className="form-label">
                <span>Student ID *</span>
                <span className="form-helper">Unique Identifier</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Hash size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--text-subtle)', pointerEvents: 'none' }} />
                <input
                  id="student-id-input"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="e.g. STU-1006 or 2024001"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Field 2: Name */}
            <div className="form-group">
              <label htmlFor="student-name-input" className="form-label">
                <span>Student Full Name *</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--text-subtle)', pointerEvents: 'none' }} />
                <input
                  id="student-name-input"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="e.g. Maya Lin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Field 3: Email */}
            <div className="form-group">
              <label htmlFor="student-email-input" className="form-label">
                <span>University Email Address *</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--text-subtle)', pointerEvents: 'none' }} />
                <input
                  id="student-email-input"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="e.g. maya.lin@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
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
                  fontSize: '0.85rem',
                  marginTop: '0.25rem'
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              id="btn-save-student"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Creating Student...'
              ) : (
                <>
                  <Check size={16} />
                  <span>Save Student</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
