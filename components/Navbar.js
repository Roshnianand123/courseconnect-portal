'use client';

import React from 'react';
import { GraduationCap, BookOpen, Users, ClipboardCheck, Plus, Database } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenRegister,
  onOpenAddStudent,
  dbStatus
}) {
  return (
    <header className="navbar-wrap">
      <nav className="navbar" aria-label="Main Navigation">
        {/* Brand Logo & Name */}
        <div className="brand-section">
          <div className="brand-icon" aria-hidden="true">
            <GraduationCap size={22} />
          </div>
          <div>
            <span className="brand-text">Course<span className="gradient-accent">Connect</span></span>
          </div>
          <span className="brand-badge">Portal</span>
        </div>

        {/* Navigation Tabs */}
        <div className="nav-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'courses'}
            id="tab-courses"
            className={`nav-tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            <BookOpen size={16} />
            <span>Courses</span>
          </button>
          
          <button
            role="tab"
            aria-selected={activeTab === 'students'}
            id="tab-students"
            className={`nav-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <Users size={16} />
            <span>Students</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'registrations'}
            id="tab-registrations"
            className={`nav-tab-btn ${activeTab === 'registrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('registrations')}
          >
            <ClipboardCheck size={16} />
            <span>Registrations</span>
          </button>
        </div>

        {/* Database Status & Quick Action Buttons */}
        <div className="nav-actions">
          {dbStatus && (
            <div className="status-indicator" title={`Connected to ${dbStatus.name}`}>
              <div className="pulse-dot"></div>
              <span>{dbStatus.name}</span>
            </div>
          )}

          <button
            id="btn-add-student-nav"
            className="btn btn-secondary btn-sm"
            onClick={onOpenAddStudent}
            title="Add a new student"
          >
            <Plus size={14} />
            <span>Add Student</span>
          </button>

          <button
            id="btn-register-course-nav"
            className="btn btn-primary btn-sm"
            onClick={onOpenRegister}
            title="Register a student for a course"
          >
            <GraduationCap size={15} />
            <span>Enroll Now</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
