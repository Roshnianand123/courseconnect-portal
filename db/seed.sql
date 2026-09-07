-- =========================================================
-- CourseConnect: Sample Seed Data
-- =========================================================

-- Insert Initial Courses
INSERT INTO Courses (CourseID, CourseName, Duration, Department, Instructor, Capacity, Description)
VALUES
    ('CS-101', 'Introduction to Computer Science', '12 Weeks', 'Computer Science', 'Dr. Alan Turing', 35, 'Fundamental concepts of computation, problem solving, algorithms, and basics of Python programming.'),
    ('CS-204', 'Data Structures and Algorithms', '14 Weeks', 'Computer Science', 'Prof. Donald Knuth', 30, 'Deep dive into arrays, linked lists, binary trees, graphs, sorting, searching, and complexity analysis.'),
    ('WD-301', 'Full Stack Web Development', '10 Weeks', 'Software Engineering', 'Prof. Tim Berners-Lee', 28, 'Modern front-end and back-end development with React.js, Node.js, REST APIs, and responsive design systems.'),
    ('DS-210', 'Applied Machine Learning & Data Science', '12 Weeks', 'Artificial Intelligence', 'Dr. Fei-Fei Li', 25, 'Supervised and unsupervised learning, regression, classification, neural networks, and model evaluation.'),
    ('CY-150', 'Cybersecurity Fundamentals & Defense', '8 Weeks', 'Information Security', 'Dr. Bruce Schneier', 24, 'Network security, cryptography, vulnerability assessment, defense mechanisms, and ethical hacking fundamentals.'),
    ('DB-220', 'Database Management Systems & SQL', '8 Weeks', 'Data Engineering', 'Dr. Edgar Codd', 30, 'Relational model, SQL query optimization, transactions, ACID properties, indexing, and NoSQL alternatives.')
ON CONFLICT (CourseID) DO NOTHING;

-- Insert Initial Students
INSERT INTO Students (StudentID, Name, Email)
VALUES
    ('STU-1001', 'Alex Johnson', 'alex.johnson@university.edu'),
    ('STU-1002', 'Sophia Martinez', 'sophia.m@university.edu'),
    ('STU-1003', 'Liam Chen', 'liam.chen@university.edu'),
    ('STU-1004', 'Emma Watson', 'emma.watson@university.edu'),
    ('STU-1005', 'Noah Patel', 'noah.patel@university.edu')
ON CONFLICT (StudentID) DO NOTHING;

-- Insert Initial Registrations
INSERT INTO Registrations (StudentID, CourseID)
VALUES
    ('STU-1001', 'CS-101'),
    ('STU-1001', 'WD-301'),
    ('STU-1002', 'CS-204'),
    ('STU-1003', 'DS-210'),
    ('STU-1004', 'CS-101'),
    ('STU-1005', 'CY-150')
ON CONFLICT DO NOTHING;
