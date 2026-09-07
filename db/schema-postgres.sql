-- =========================================================
-- CourseConnect: PostgreSQL Database Schema
-- Tables: Students, Courses, Registrations
-- =========================================================

-- 1. Students Table
CREATE TABLE IF NOT EXISTS Students (
    StudentID VARCHAR(50) PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS Courses (
    CourseID VARCHAR(50) PRIMARY KEY,
    CourseName VARCHAR(255) NOT NULL,
    Duration VARCHAR(100) NOT NULL,
    Department VARCHAR(100) DEFAULT 'Computer Science',
    Instructor VARCHAR(255) DEFAULT 'Faculty Staff',
    Capacity INT DEFAULT 30,
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Registrations Table
CREATE TABLE IF NOT EXISTS Registrations (
    RegistrationID SERIAL PRIMARY KEY,
    StudentID VARCHAR(50) NOT NULL REFERENCES Students(StudentID) ON DELETE CASCADE,
    CourseID VARCHAR(50) NOT NULL REFERENCES Courses(CourseID) ON DELETE CASCADE,
    RegisteredAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_course UNIQUE (StudentID, CourseID)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reg_student ON Registrations(StudentID);
CREATE INDEX IF NOT EXISTS idx_reg_course ON Registrations(CourseID);
