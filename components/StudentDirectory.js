'use client';

import React, { useState, useMemo } from 'react';
import { Search, UserPlus, Mail, Hash, BookOpen, GraduationCap } from 'lucide-react';

export default function StudentDirectory({
  students,
  onOpenAddStudent,
  onRegisterStudent,
  onFilterByStudent
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return students;
    return students.filter(s =>
      s.Name.toLowerCase().includes(q) ||
      s.StudentID.toLowerCase().includes(q) ||
      s.Email.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  return (
    <section aria-labelledby="students-heading">
      {/* Section Header */}
      <div className="section-header">
        <div className="section-title-wrap">
          <h1 id="students-heading" className="section-title">
            <span>Student Directory</span>
            <span className="brand-badge">{students.length} Total</span>
          </h1>
          <p className="section-desc">
            Manage university student profiles, view enrollment counts, and register new learners.
          </p>
        </div>

        <div className="section-toolbar">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" aria-hidden="true" />
            <input
              id="student-search-input"
              type="text"
              className="input-field"
              placeholder="Search by student name, ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search students"
            />
          </div>

          <button
            id="btn-add-student-dir"
            className="btn btn-primary"
            onClick={onOpenAddStudent}
          >
            <UserPlus size={16} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Students Data Table */}
      {filteredStudents.length > 0 ? (
        <div className="table-container">
          <table className="custom-table" aria-label="Students List">
            <thead>
              <tr>
                <th>Student</th>
                <th>Student ID</th>
                <th>Email Address</th>
                <th>Active Courses</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const initials = student.Name
                  .split(' ')
                  .map(part => part[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <tr key={student.StudentID} id={`student-row-${student.StudentID}`}>
                    <td>
                      <div className="student-info-cell">
                        <div className="student-avatar" aria-hidden="true">
                          {initials}
                        </div>
                        <div>
                          <div className="student-name-text">{student.Name}</div>
                          <div className="student-email-text">{student.Email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="course-id-badge">{student.StudentID}</span>
                    </td>
                    <td>
                      <a
                        href={`mailto:${student.Email}`}
                        style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <Mail size={14} style={{ color: 'var(--accent-cyan)' }} />
                        <span>{student.Email}</span>
                      </a>
                    </td>
                    <td>
                      <button
                        className="seats-badge available"
                        style={{ cursor: 'pointer', border: 'none' }}
                        onClick={() => onFilterByStudent(student.StudentID)}
                        title="Click to view registered courses"
                      >
                        <BookOpen size={12} />
                        <span>{student.EnrolledCount || 0} Registered</span>
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        id={`btn-enroll-student-${student.StudentID}`}
                        className="btn btn-secondary btn-sm"
                        onClick={() => onRegisterStudent(student)}
                        title={`Register ${student.Name} for a course`}
                      >
                        <GraduationCap size={14} />
                        <span>Enroll</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-panel empty-state">
          <div className="empty-state-icon">
            <Search size={32} />
          </div>
          <h3 className="empty-state-title">No Students Found</h3>
          <p className="empty-state-desc">
            No student matches &quot;{searchQuery}&quot;. Clear your search or add a new student.
          </p>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setSearchQuery('')}
          >
            Reset Search
          </button>
        </div>
      )}
    </section>
  );
}
