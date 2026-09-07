-- =========================================================
-- CourseConnect: MySQL Database Schema
-- Tables: Students, Courses, Registrations
-- =========================================================

-- 1. Students Table
CREATE TABLE IF NOT EXISTS Students (
    StudentID VARCHAR(50) PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS Courses (
    CourseID VARCHAR(50) PRIMARY KEY,
    CourseName VARCHAR(255) NOT NULL,
    Duration VARCHAR(100) NOT NULL,
    Department VARCHAR(100) DEFAULT 'Computer Science',
    Instructor VARCHAR(255) DEFAULT 'Faculty Staff',
    Capacity INT DEFAULT 30,
    Description TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Registrations Table
CREATE TABLE IF NOT EXISTS Registrations (
    RegistrationID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID VARCHAR(50) NOT NULL,
    CourseID VARCHAR(50) NOT NULL,
    RegisteredAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reg_student FOREIGN KEY (StudentID) REFERENCES Students(StudentID) ON DELETE CASCADE,
    CONSTRAINT fk_reg_course FOREIGN KEY (CourseID) REFERENCES Courses(CourseID) ON DELETE CASCADE,
    CONSTRAINT unique_student_course UNIQUE (StudentID, CourseID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes for performance
CREATE INDEX idx_reg_student ON Registrations(StudentID);
CREATE INDEX idx_reg_course ON Registrations(CourseID);
