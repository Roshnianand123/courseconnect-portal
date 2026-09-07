'use client';

import React, { useState } from 'react';
import { UserPlus, Mail, User, Hash, Check } from 'lucide-react';

export default function AddStudentModal({
  isOpen,
  onClose,
  onStudentAdded
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [customStudentId, setCustomStudentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMessage('Please enter both student name and email address.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      setErrorMessage('Please enter a valid email address (e.g. name@university.edu).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Name: name.trim(),
          Email: email.trim(),
          StudentID: customStudentId.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to register student.');
      }

      onStudentAdded(data.student);
      setName('');
      setEmail('');
      setCustomStudentId('');
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
            <span>Add New Student</span>
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
            {/* Student Name */}
            <div className="form-group">
              <label htmlFor="student-name-input" className="form-label">
                <span>Student Full Name *</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="student-name-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Maya Lin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label htmlFor="student-email-input" className="form-label">
                <span>University Email Address *</span>
              </label>
              <input
                id="student-email-input"
                type="email"
                className="form-input"
                placeholder="e.g. maya.lin@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Optional Custom Student ID */}
            <div className="form-group">
              <label htmlFor="student-id-input" className="form-label">
                <span>Custom Student ID (Optional)</span>
                <span className="form-helper">Auto-generated if left blank</span>
              </label>
              <input
                id="student-id-input"
                type="text"
                className="form-input"
                placeholder="e.g. STU-1006 (leave blank for auto)"
                value={customStudentId}
                onChange={(e) => setCustomStudentId(e.target.value)}
              />
            </div>

            {errorMessage && (
              <div className="form-error">
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
              id="btn-save-student"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Adding Student...'
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
