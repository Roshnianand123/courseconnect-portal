'use client';

import React, { useState, useMemo } from 'react';
import { Search, Clock, User, Award, BookPlus, UserCheck, CheckCircle, AlertCircle } from 'lucide-react';

export default function CourseList({
  courses,
  onRegisterForCourse,
  onOpenAddCourse
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Extract unique departments
  const departments = useMemo(() => {
    const set = new Set(courses.map(c => c.Department || 'General'));
    return ['ALL', ...Array.from(set)];
  }, [courses]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchDept = selectedDept === 'ALL' || (c.Department || 'General') === selectedDept;
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        c.CourseName.toLowerCase().includes(query) ||
        c.CourseID.toLowerCase().includes(query) ||
        (c.Instructor && c.Instructor.toLowerCase().includes(query)) ||
        (c.Description && c.Description.toLowerCase().includes(query));
      return matchDept && matchQuery;
    });
  }, [courses, searchQuery, selectedDept]);

  return (
    <section aria-labelledby="courses-heading">
      {/* Section Header */}
      <div className="section-header">
        <div className="section-title-wrap">
          <h1 id="courses-heading" className="section-title">
            <span>Available Courses</span>
            <span className="brand-badge">{courses.length} Listed</span>
          </h1>
          <p className="section-desc">
            Explore academic curriculum, review course durations, and enroll students.
          </p>
        </div>

        {/* Toolbar: Search, Filter, and Add Course */}
        <div className="section-toolbar">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" aria-hidden="true" />
            <input
              id="course-search-input"
              type="text"
              className="input-field"
              placeholder="Search course name, code, or instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search courses"
            />
          </div>

          <select
            id="course-dept-filter"
            className="filter-select"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            aria-label="Filter by department"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'ALL' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="course-grid">
          {filteredCourses.map((course) => {
            const seatsLeft = course.SeatsLeft !== undefined ? course.SeatsLeft : Math.max(0, (course.Capacity || 30) - (course.EnrolledCount || 0));
            const isFull = seatsLeft <= 0;
            const isLow = seatsLeft > 0 && seatsLeft <= 5;

            return (
              <article
                key={course.CourseID}
                id={`course-card-${course.CourseID}`}
                className="glass-panel course-card"
              >
                <div>
                  <div className="course-card-top">
                    <span className="course-id-badge">{course.CourseID}</span>
                    <span className="course-department">{course.Department || 'Academic'}</span>
                  </div>

                  <h2 className="course-title">{course.CourseName}</h2>
                  
                  {course.Description && (
                    <p className="course-desc">{course.Description}</p>
                  )}
                </div>

                <div>
                  {/* Meta Details: Duration & Instructor */}
                  <div className="course-meta-row">
                    <div className="course-meta-item" title="Duration">
                      <Clock size={15} />
                      <span>{course.Duration}</span>
                    </div>

                    {course.Instructor && (
                      <div className="course-meta-item" title="Faculty Instructor">
                        <User size={15} />
                        <span>{course.Instructor}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Enrolled status & Register action */}
                  <div className="course-card-footer">
                    <div className="capacity-status">
                      <span className="capacity-text">
                        Enrolled: {course.EnrolledCount || 0} / {course.Capacity || 30}
                      </span>
                      <span className={`seats-badge ${isFull ? 'full' : isLow ? 'low' : 'available'}`}>
                        {isFull ? (
                          <>
                            <AlertCircle size={12} />
                            <span>Course Full</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={12} />
                            <span>{seatsLeft} Seats Available</span>
                          </>
                        )}
                      </span>
                    </div>

                    <button
                      id={`btn-register-${course.CourseID}`}
                      className="btn btn-primary btn-sm"
                      disabled={isFull}
                      onClick={() => onRegisterForCourse(course)}
                      title={isFull ? 'Course is full' : `Register student for ${course.CourseName}`}
                    >
                      <UserCheck size={14} />
                      <span>{isFull ? 'Full' : 'Enroll'}</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel empty-state">
          <div className="empty-state-icon">
            <Search size={32} />
          </div>
          <h3 className="empty-state-title">No Courses Match Your Criteria</h3>
          <p className="empty-state-desc">
            Try adjusting your search terms or selecting a different department category.
          </p>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { setSearchQuery(''); setSelectedDept('ALL'); }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </section>
  );
}
