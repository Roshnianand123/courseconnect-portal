'use client';

import React from 'react';
import { BookOpen, Users, ClipboardCheck, TrendingUp } from 'lucide-react';

export default function StatsOverview({ stats, onSelectTab }) {
  if (!stats) return null;

  return (
    <div className="stats-grid" aria-label="Portal Highlights">
      {/* 1. Total Courses */}
      <div
        className="glass-panel stat-card indigo"
        onClick={() => onSelectTab && onSelectTab('courses')}
        style={{ cursor: 'pointer' }}
        id="stat-courses-card"
      >
        <div className="stat-info">
          <span className="stat-label">Available Courses</span>
          <span className="stat-value">{stats.totalCourses || 0}</span>
          <span className="stat-sub">Across diverse departments</span>
        </div>
        <div className="stat-icon-wrap indigo">
          <BookOpen size={24} />
        </div>
      </div>

      {/* 2. Registered Students */}
      <div
        className="glass-panel stat-card cyan"
        onClick={() => onSelectTab && onSelectTab('students')}
        style={{ cursor: 'pointer' }}
        id="stat-students-card"
      >
        <div className="stat-info">
          <span className="stat-label">Enrolled Students</span>
          <span className="stat-value">{stats.totalStudents || 0}</span>
          <span className="stat-sub">Active learners in directory</span>
        </div>
        <div className="stat-icon-wrap cyan">
          <Users size={24} />
        </div>
      </div>

      {/* 3. Course Registrations */}
      <div
        className="glass-panel stat-card violet"
        onClick={() => onSelectTab && onSelectTab('registrations')}
        style={{ cursor: 'pointer' }}
        id="stat-registrations-card"
      >
        <div className="stat-info">
          <span className="stat-label">Total Registrations</span>
          <span className="stat-value">{stats.totalRegistrations || 0}</span>
          <span className="stat-sub">Active course enrollments</span>
        </div>
        <div className="stat-icon-wrap violet">
          <ClipboardCheck size={24} />
        </div>
      </div>

      {/* 4. Seat Fill Rate */}
      <div className="glass-panel stat-card emerald" id="stat-capacity-card">
        <div className="stat-info">
          <span className="stat-label">Campus Seat Fill Rate</span>
          <span className="stat-value">{stats.fillRate || '0%'}</span>
          <span className="stat-sub">Capacity utilization</span>
        </div>
        <div className="stat-icon-wrap emerald">
          <TrendingUp size={24} />
        </div>
      </div>
    </div>
  );
}
