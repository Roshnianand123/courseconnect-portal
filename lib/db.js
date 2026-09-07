import fs from 'fs';
import path from 'path';

// Connection instances cache across serverless warm invocations
let pgPool = null;
let mysqlPool = null;

// PostgreSQL returns column names in lowercase. This maps them back to PascalCase
// so the frontend receives consistent property names regardless of database backend.
const PG_COLUMN_MAP = {
  studentid: 'StudentID',
  name: 'Name',
  email: 'Email',
  createdat: 'CreatedAt',
  courseid: 'CourseID',
  coursename: 'CourseName',
  duration: 'Duration',
  department: 'Department',
  instructor: 'Instructor',
  capacity: 'Capacity',
  description: 'Description',
  registrationid: 'RegistrationID',
  registeredat: 'RegisteredAt',
  enrolledcount: 'EnrolledCount',
  studentname: 'StudentName',
  studentemail: 'StudentEmail',
  seatsleft: 'SeatsLeft'
};

function normalizePgRow(row) {
  if (!row) return row;
  const normalized = {};
  for (const [key, value] of Object.entries(row)) {
    const mappedKey = PG_COLUMN_MAP[key.toLowerCase()] || key;
    normalized[mappedKey] = value;
  }
  return normalized;
}

const INITIAL_COURSES = [
  {
    CourseID: 'CS-101',
    CourseName: 'Introduction to Computer Science',
    Duration: '12 Weeks',
    Department: 'Computer Science',
    Instructor: 'Dr. Alan Turing',
    Capacity: 35,
    Description: 'Fundamental concepts of computation, problem solving, algorithms, and basics of Python programming.'
  },
  {
    CourseID: 'CS-204',
    CourseName: 'Data Structures and Algorithms',
    Duration: '14 Weeks',
    Department: 'Computer Science',
    Instructor: 'Prof. Donald Knuth',
    Capacity: 30,
    Description: 'Deep dive into arrays, linked lists, binary trees, graphs, sorting, searching, and complexity analysis.'
  },
  {
    CourseID: 'WD-301',
    CourseName: 'Full Stack Web Development',
    Duration: '10 Weeks',
    Department: 'Software Engineering',
    Instructor: 'Prof. Tim Berners-Lee',
    Capacity: 28,
    Description: 'Modern front-end and back-end development with React.js, Node.js, REST APIs, and responsive design systems.'
  },
  {
    CourseID: 'DS-210',
    CourseName: 'Applied Machine Learning & Data Science',
    Duration: '12 Weeks',
    Department: 'Artificial Intelligence',
    Instructor: 'Dr. Fei-Fei Li',
    Capacity: 25,
    Description: 'Supervised and unsupervised learning, regression, classification, neural networks, and model evaluation.'
  },
  {
    CourseID: 'CY-150',
    CourseName: 'Cybersecurity Fundamentals & Defense',
    Duration: '8 Weeks',
    Department: 'Information Security',
    Instructor: 'Dr. Bruce Schneier',
    Capacity: 24,
    Description: 'Network security, cryptography, vulnerability assessment, defense mechanisms, and ethical hacking fundamentals.'
  },
  {
    CourseID: 'DB-220',
    CourseName: 'Database Management Systems & SQL',
    Duration: '8 Weeks',
    Department: 'Data Engineering',
    Instructor: 'Dr. Edgar Codd',
    Capacity: 30,
    Description: 'Relational model, SQL query optimization, transactions, ACID properties, indexing, and NoSQL alternatives.'
  }
];

const INITIAL_STUDENTS = [
  { StudentID: 'STU-1001', Name: 'Alex Johnson', Email: 'alex.johnson@university.edu' },
  { StudentID: 'STU-1002', Name: 'Sophia Martinez', Email: 'sophia.m@university.edu' },
  { StudentID: 'STU-1003', Name: 'Liam Chen', Email: 'liam.chen@university.edu' },
  { StudentID: 'STU-1004', Name: 'Emma Watson', Email: 'emma.watson@university.edu' },
  { StudentID: 'STU-1005', Name: 'Noah Patel', Email: 'noah.patel@university.edu' }
];

const INITIAL_REGISTRATIONS = [
  { RegistrationID: 1, StudentID: 'STU-1001', CourseID: 'CS-101', RegisteredAt: '2026-09-01 09:00:00' },
  { RegistrationID: 2, StudentID: 'STU-1001', CourseID: 'WD-301', RegisteredAt: '2026-09-01 09:30:00' },
  { RegistrationID: 3, StudentID: 'STU-1002', CourseID: 'CS-204', RegisteredAt: '2026-09-02 11:15:00' },
  { RegistrationID: 4, StudentID: 'STU-1003', CourseID: 'DS-210', RegisteredAt: '2026-09-03 14:20:00' },
  { RegistrationID: 5, StudentID: 'STU-1004', CourseID: 'CS-101', RegisteredAt: '2026-09-04 10:05:00' },
  { RegistrationID: 6, StudentID: 'STU-1005', CourseID: 'CY-150', RegisteredAt: '2026-09-05 16:45:00' }
];

// Determine database dialect from environment variables
function getDialect() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.MYSQL_URL || '';
  if (url.startsWith('postgres://') || url.startsWith('postgresql://') || process.env.PGHOST) {
    return 'postgres';
  }
  if (url.startsWith('mysql://') || process.env.MYSQL_HOST) {
    return 'mysql';
  }
  return 'local';
}

// -------------------------------------------------------------
// LOCAL EMBEDDED RELATIONAL STORE (For offline / zero-config dev)
// -------------------------------------------------------------
const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'courseconnect.json');

function ensureLocalData() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const data = {
      Students: [...INITIAL_STUDENTS],
      Courses: [...INITIAL_COURSES],
      Registrations: [...INITIAL_REGISTRATIONS],
      nextRegistrationId: 7
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }
}

function readLocalData() {
  ensureLocalData();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return {
      Students: [...INITIAL_STUDENTS],
      Courses: [...INITIAL_COURSES],
      Registrations: [...INITIAL_REGISTRATIONS],
      nextRegistrationId: 7
    };
  }
}

function writeLocalData(data) {
  ensureLocalData();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// -------------------------------------------------------------
// POSTGRES CLIENT SETUP
// -------------------------------------------------------------
async function getPgPool() {
  if (pgPool) return pgPool;
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const isNeon = connectionString && connectionString.includes('neon.tech');

  if (isNeon) {
    // Neon requires its own serverless driver (WebSocket-based)
    const { Pool, neonConfig } = await import('@neondatabase/serverless');
    // In Node.js (non-edge), use the ws WebSocket implementation
    try {
      const ws = await import('ws');
      neonConfig.webSocketConstructor = ws.default || ws;
    } catch (e) {
      // ws not available — running on edge runtime, Neon driver handles it natively
    }
    pgPool = new Pool({ connectionString });
  } else {
    // Standard pg Pool for non-Neon PostgreSQL
    const { Pool } = await import('pg');
    const useSSL = connectionString && connectionString.includes('sslmode=require');
    pgPool = new Pool({
      connectionString,
      ssl: useSSL ? { rejectUnauthorized: false } : (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined),
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }


  // Ensure tables exist — Neon pooler requires individual statements
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS Students (
      StudentID VARCHAR(50) PRIMARY KEY,
      Name VARCHAR(255) NOT NULL,
      Email VARCHAR(255) UNIQUE NOT NULL,
      CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS Courses (
      CourseID VARCHAR(50) PRIMARY KEY,
      CourseName VARCHAR(255) NOT NULL,
      Duration VARCHAR(100) NOT NULL,
      Department VARCHAR(100) DEFAULT 'Computer Science',
      Instructor VARCHAR(255) DEFAULT 'Faculty Staff',
      Capacity INT DEFAULT 30,
      Description TEXT,
      CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS Registrations (
      RegistrationID SERIAL PRIMARY KEY,
      StudentID VARCHAR(50) NOT NULL REFERENCES Students(StudentID) ON DELETE CASCADE,
      CourseID VARCHAR(50) NOT NULL REFERENCES Courses(CourseID) ON DELETE CASCADE,
      RegisteredAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_student_course UNIQUE (StudentID, CourseID)
    )
  `);

  // Seed if empty
  const countRes = await pgPool.query('SELECT COUNT(*) FROM Courses');
  if (parseInt(countRes.rows[0].count, 10) === 0) {
    for (const c of INITIAL_COURSES) {
      await pgPool.query(
        `INSERT INTO Courses (CourseID, CourseName, Duration, Department, Instructor, Capacity, Description)
         VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (CourseID) DO NOTHING`,
        [c.CourseID, c.CourseName, c.Duration, c.Department, c.Instructor, c.Capacity, c.Description]
      );
    }
    for (const s of INITIAL_STUDENTS) {
      await pgPool.query(
        `INSERT INTO Students (StudentID, Name, Email) VALUES ($1, $2, $3) ON CONFLICT (StudentID) DO NOTHING`,
        [s.StudentID, s.Name, s.Email]
      );
    }
    for (const r of INITIAL_REGISTRATIONS) {
      await pgPool.query(
        `INSERT INTO Registrations (RegistrationID, StudentID, CourseID, RegisteredAt)
         VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
        [r.RegistrationID, r.StudentID, r.CourseID, r.RegisteredAt]
      );
    }
    // Reset the sequence to be after our seed data
    await pgPool.query(`SELECT setval('registrations_registrationid_seq', (SELECT COALESCE(MAX(RegistrationID), 0) FROM Registrations))`);
  }

  return pgPool;
}


// -------------------------------------------------------------
// MYSQL CLIENT SETUP
// -------------------------------------------------------------
async function getMysqlPool() {
  if (mysqlPool) return mysqlPool;
  const mysql = await import('mysql2/promise');
  const uri = process.env.DATABASE_URL || process.env.MYSQL_URL;
  mysqlPool = mysql.createPool(uri || {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'courseconnect',
    waitForConnections: true,
    connectionLimit: 10
  });

  // Ensure tables exist
  await mysqlPool.query(`
    CREATE TABLE IF NOT EXISTS Students (
      StudentID VARCHAR(50) PRIMARY KEY,
      Name VARCHAR(255) NOT NULL,
      Email VARCHAR(255) UNIQUE NOT NULL,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);
  await mysqlPool.query(`
    CREATE TABLE IF NOT EXISTS Courses (
      CourseID VARCHAR(50) PRIMARY KEY,
      CourseName VARCHAR(255) NOT NULL,
      Duration VARCHAR(100) NOT NULL,
      Department VARCHAR(100) DEFAULT 'Computer Science',
      Instructor VARCHAR(255) DEFAULT 'Faculty Staff',
      Capacity INT DEFAULT 30,
      Description TEXT,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);
  await mysqlPool.query(`
    CREATE TABLE IF NOT EXISTS Registrations (
      RegistrationID INT AUTO_INCREMENT PRIMARY KEY,
      StudentID VARCHAR(50) NOT NULL,
      CourseID VARCHAR(50) NOT NULL,
      RegisteredAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_student_course UNIQUE (StudentID, CourseID)
    ) ENGINE=InnoDB;
  `);

  return mysqlPool;
}

// -------------------------------------------------------------
// UNIFIED DATABASE METHODS
// -------------------------------------------------------------

export async function getDbStatus() {
  const dialect = getDialect();
  return {
    dialect,
    name: dialect === 'postgres' ? 'PostgreSQL' : dialect === 'mysql' ? 'MySQL' : 'Embedded Relational (Ready)',
    isConnected: true
  };
}

// Courses
export async function getCourses() {
  const dialect = getDialect();

  if (dialect === 'postgres') {
    const pool = await getPgPool();
    const res = await pool.query(`
      SELECT 
        c.*,
        COUNT(r.RegistrationID)::int AS EnrolledCount
      FROM Courses c
      LEFT JOIN Registrations r ON c.CourseID = r.CourseID
      GROUP BY c.CourseID
      ORDER BY c.CourseID ASC
    `);
    return res.rows.map(row => {
      const n = normalizePgRow(row);
      return {
        ...n,
        SeatsLeft: Math.max(0, (n.Capacity || 30) - (n.EnrolledCount || 0))
      };
    });
  }

  if (dialect === 'mysql') {
    const pool = await getMysqlPool();
    const [rows] = await pool.query(`
      SELECT 
        c.*,
        COUNT(r.RegistrationID) AS EnrolledCount
      FROM Courses c
      LEFT JOIN Registrations r ON c.CourseID = r.CourseID
      GROUP BY c.CourseID
      ORDER BY c.CourseID ASC
    `);
    return rows.map(row => ({
      ...row,
      EnrolledCount: Number(row.EnrolledCount || 0),
      SeatsLeft: Math.max(0, (row.Capacity || 30) - Number(row.EnrolledCount || 0))
    }));
  }

  // Local fallback
  const data = readLocalData();
  return data.Courses.map(course => {
    const cId = (course.CourseID || '').trim().toUpperCase();
    const enrolled = data.Registrations.filter(
      r => (r.CourseID || '').trim().toUpperCase() === cId
    ).length;
    const capacity = course.Capacity || 30;
    return {
      ...course,
      EnrolledCount: enrolled,
      SeatsLeft: Math.max(0, capacity - enrolled)
    };
  });
}

export async function addCourse(course) {
  const dialect = getDialect();
  const { CourseID, CourseName, Duration, Department = 'General', Instructor = 'Faculty Member', Capacity = 30, Description = '' } = course;

  if (!CourseID || !CourseName || !Duration) {
    throw new Error('CourseID, CourseName, and Duration are required fields.');
  }

  if (dialect === 'postgres') {
    const pool = await getPgPool();
    const res = await pool.query(
      `INSERT INTO Courses (CourseID, CourseName, Duration, Department, Instructor, Capacity, Description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [CourseID.trim().toUpperCase(), CourseName.trim(), Duration.trim(), Department, Instructor, Number(Capacity), Description]
    );
    return normalizePgRow(res.rows[0]);
  }

  if (dialect === 'mysql') {
    const pool = await getMysqlPool();
    await pool.query(
      `INSERT INTO Courses (CourseID, CourseName, Duration, Department, Instructor, Capacity, Description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [CourseID.trim().toUpperCase(), CourseName.trim(), Duration.trim(), Department, Instructor, Number(Capacity), Description]
    );
    return { CourseID: CourseID.trim().toUpperCase(), CourseName, Duration, Department, Instructor, Capacity, Description };
  }

  const data = readLocalData();
  const idUpper = CourseID.trim().toUpperCase();
  if (data.Courses.some(c => c.CourseID.toUpperCase() === idUpper)) {
    throw new Error(`Course with ID ${idUpper} already exists.`);
  }

  const newCourse = {
    CourseID: idUpper,
    CourseName: CourseName.trim(),
    Duration: Duration.trim(),
    Department: Department.trim(),
    Instructor: Instructor.trim(),
    Capacity: Number(Capacity) || 30,
    Description: Description.trim(),
    CreatedAt: new Date().toISOString()
  };
  data.Courses.push(newCourse);
  writeLocalData(data);
  return newCourse;
}

// Students
export async function getStudents() {
  const dialect = getDialect();

  if (dialect === 'postgres') {
    const pool = await getPgPool();
    const res = await pool.query(`
      SELECT 
        s.*,
        COUNT(r.RegistrationID)::int AS EnrolledCount
      FROM Students s
      LEFT JOIN Registrations r ON s.StudentID = r.StudentID
      GROUP BY s.StudentID
      ORDER BY s.StudentID ASC
    `);
    return res.rows.map(normalizePgRow);
  }

  if (dialect === 'mysql') {
    const pool = await getMysqlPool();
    const [rows] = await pool.query(`
      SELECT 
        s.*,
        COUNT(r.RegistrationID) AS EnrolledCount
      FROM Students s
      LEFT JOIN Registrations r ON s.StudentID = r.StudentID
      GROUP BY s.StudentID
      ORDER BY s.StudentID ASC
    `);
    return rows.map(r => ({ ...r, EnrolledCount: Number(r.EnrolledCount || 0) }));
  }

  const data = readLocalData();
  return data.Students.map(student => {
    const sId = (student.StudentID || '').trim().toUpperCase();
    const count = data.Registrations.filter(
      r => (r.StudentID || '').trim().toUpperCase() === sId
    ).length;
    return {
      ...student,
      EnrolledCount: count
    };
  });
}

export async function addStudent(student) {
  const dialect = getDialect();
  let { StudentID, Name, Email } = student;

  if (!StudentID || !StudentID.trim()) {
    throw new Error('Student ID is required and cannot be empty.');
  }

  if (!Name || !Name.trim()) {
    throw new Error('Name is required and cannot be empty.');
  }

  if (!Email || !Email.trim()) {
    throw new Error('Email is required and cannot be empty.');
  }

  StudentID = StudentID.trim();
  Name = Name.trim();
  Email = Email.trim().toLowerCase();

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(Email)) {
    throw new Error('Please provide a valid email address (e.g. name@university.edu).');
  }

  if (dialect === 'postgres') {
    const pool = await getPgPool();
    // Check for duplicate StudentID or Email
    const dupCheck = await pool.query(
      `SELECT StudentID, Email FROM Students WHERE UPPER(StudentID) = UPPER($1) OR LOWER(Email) = LOWER($2)`,
      [StudentID, Email]
    );

    if (dupCheck.rows.length > 0) {
      const existing = normalizePgRow(dupCheck.rows[0]);
      if (existing.StudentID && existing.StudentID.toUpperCase() === StudentID.toUpperCase()) {
        throw new Error(`Student ID "${StudentID}" already exists.`);
      }
      if (existing.Email && existing.Email.toLowerCase() === Email) {
        throw new Error(`Student with email "${Email}" is already registered.`);
      }
    }

    const res = await pool.query(
      `INSERT INTO Students (StudentID, Name, Email) VALUES ($1, $2, $3) RETURNING *`,
      [StudentID, Name, Email]
    );
    return normalizePgRow(res.rows[0]);
  }

  if (dialect === 'mysql') {
    const pool = await getMysqlPool();
    // Check for duplicate StudentID or Email
    const [dupCheck] = await pool.query(
      `SELECT StudentID, Email FROM Students WHERE UPPER(StudentID) = UPPER(?) OR LOWER(Email) = LOWER(?)`,
      [StudentID, Email]
    );

    if (dupCheck.length > 0) {
      const existing = dupCheck[0];
      if (existing.StudentID.toUpperCase() === StudentID.toUpperCase()) {
        throw new Error(`Student ID "${StudentID}" already exists.`);
      }
      if (existing.Email.toLowerCase() === Email) {
        throw new Error(`Student with email "${Email}" is already registered.`);
      }
    }

    await pool.query(
      `INSERT INTO Students (StudentID, Name, Email) VALUES (?, ?, ?)`,
      [StudentID, Name, Email]
    );
    return { StudentID, Name, Email };
  }

  // Local embedded storage
  const data = readLocalData();

  // Check duplicate StudentID
  const duplicateId = data.Students.find(
    s => s.StudentID.trim().toUpperCase() === StudentID.toUpperCase()
  );
  if (duplicateId) {
    throw new Error(`Student ID "${StudentID}" already exists.`);
  }

  // Check duplicate Email
  const duplicateEmail = data.Students.find(
    s => s.Email.trim().toLowerCase() === Email
  );
  if (duplicateEmail) {
    throw new Error(`Student with email "${Email}" is already registered (${duplicateEmail.Name}).`);
  }

  const newStudent = {
    StudentID,
    Name,
    Email,
    CreatedAt: new Date().toISOString()
  };

  data.Students.push(newStudent);
  writeLocalData(data);
  return newStudent;
}

// Registrations
export async function getRegistrations() {
  const dialect = getDialect();

  if (dialect === 'postgres') {
    const pool = await getPgPool();
    const res = await pool.query(`
      SELECT 
        r.RegistrationID,
        r.StudentID,
        r.CourseID,
        r.RegisteredAt,
        s.Name AS StudentName,
        s.Email AS StudentEmail,
        c.CourseName,
        c.Duration,
        c.Department
      FROM Registrations r
      JOIN Students s ON r.StudentID = s.StudentID
      JOIN Courses c ON r.CourseID = c.CourseID
      ORDER BY r.RegistrationID DESC
    `);
    return res.rows.map(normalizePgRow);
  }

  if (dialect === 'mysql') {
    const pool = await getMysqlPool();
    const [rows] = await pool.query(`
      SELECT 
        r.RegistrationID,
        r.StudentID,
        r.CourseID,
        r.RegisteredAt,
        s.Name AS StudentName,
        s.Email AS StudentEmail,
        c.CourseName,
        c.Duration,
        c.Department
      FROM Registrations r
      JOIN Students s ON r.StudentID = s.StudentID
      JOIN Courses c ON r.CourseID = c.CourseID
      ORDER BY r.RegistrationID DESC
    `);
    return rows;
  }

  const data = readLocalData();
  const studentMap = new Map(data.Students.map(s => [(s.StudentID || '').trim().toUpperCase(), s]));
  const courseMap = new Map(data.Courses.map(c => [(c.CourseID || '').trim().toUpperCase(), c]));

  return data.Registrations
    .map(r => {
      const sId = (r.StudentID || '').trim().toUpperCase();
      const cId = (r.CourseID || '').trim().toUpperCase();
      const student = studentMap.get(sId) || { Name: r.StudentID, Email: '' };
      const course = courseMap.get(cId) || { CourseName: r.CourseID, Duration: '', Department: '' };
      return {
        RegistrationID: r.RegistrationID,
        StudentID: r.StudentID,
        CourseID: r.CourseID,
        RegisteredAt: r.RegisteredAt || new Date().toISOString(),
        StudentName: student.Name,
        StudentEmail: student.Email,
        CourseName: course.CourseName,
        Duration: course.Duration,
        Department: course.Department
      };
    })
    .sort((a, b) => b.RegistrationID - a.RegistrationID);
}

export async function addRegistration({ StudentID, CourseID }) {
  if (!StudentID || !CourseID) {
    throw new Error('StudentID and CourseID are required.');
  }

  const sId = StudentID.trim();
  const cId = CourseID.trim();
  const dialect = getDialect();

  if (dialect === 'postgres') {
    const pool = await getPgPool();

    // Check duplicate
    const check = await pool.query(
      `SELECT * FROM Registrations WHERE StudentID = $1 AND CourseID = $2`,
      [sId, cId]
    );
    if (check.rows.length > 0) {
      throw new Error(`Student ${sId} is already registered for course ${cId}.`);
    }

    const res = await pool.query(
      `INSERT INTO Registrations (StudentID, CourseID) VALUES ($1, $2) RETURNING *`,
      [sId, cId]
    );
    return normalizePgRow(res.rows[0]);
  }

  if (dialect === 'mysql') {
    const pool = await getMysqlPool();
    const [check] = await pool.query(
      `SELECT * FROM Registrations WHERE StudentID = ? AND CourseID = ?`,
      [sId, cId]
    );
    if (check.length > 0) {
      throw new Error(`Student ${sId} is already registered for course ${cId}.`);
    }

    const [insertRes] = await pool.query(
      `INSERT INTO Registrations (StudentID, CourseID) VALUES (?, ?)`,
      [sId, cId]
    );
    return { RegistrationID: insertRes.insertId, StudentID: sId, CourseID: cId };
  }

  const data = readLocalData();

  // Validate student exists
  const student = data.Students.find(s => s.StudentID.toUpperCase() === sId.toUpperCase());
  if (!student) {
    throw new Error(`Student with ID "${sId}" was not found.`);
  }

  // Validate course exists
  const course = data.Courses.find(c => c.CourseID.toUpperCase() === cId.toUpperCase());
  if (!course) {
    throw new Error(`Course with ID "${cId}" was not found.`);
  }

  // Check duplicate
  const duplicate = data.Registrations.some(
    r => r.StudentID.toUpperCase() === sId.toUpperCase() && r.CourseID.toUpperCase() === cId.toUpperCase()
  );
  if (duplicate) {
    throw new Error(`Student "${student.Name}" (${sId}) is already registered for "${course.CourseName}" (${cId}).`);
  }

  // Check capacity
  const enrolledCount = data.Registrations.filter(r => r.CourseID.toUpperCase() === cId.toUpperCase()).length;
  if (enrolledCount >= (course.Capacity || 30)) {
    throw new Error(`Course ${cId} is fully booked (${course.Capacity} seats filled).`);
  }

  const newReg = {
    RegistrationID: data.nextRegistrationId++,
    StudentID: student.StudentID,
    CourseID: course.CourseID,
    RegisteredAt: new Date().toISOString()
  };

  data.Registrations.push(newReg);
  writeLocalData(data);
  return {
    ...newReg,
    StudentName: student.Name,
    CourseName: course.CourseName
  };
}

export async function deleteRegistration(registrationId) {
  const regId = Number(registrationId);
  if (!regId) {
    throw new Error('Valid RegistrationID is required.');
  }

  const dialect = getDialect();

  if (dialect === 'postgres') {
    const pool = await getPgPool();
    const res = await pool.query(
      `DELETE FROM Registrations WHERE RegistrationID = $1 RETURNING *`,
      [regId]
    );
    if (res.rowCount === 0) {
      throw new Error(`Registration #${regId} not found.`);
    }
    return normalizePgRow(res.rows[0]);
  }

  if (dialect === 'mysql') {
    const pool = await getMysqlPool();
    const [res] = await pool.query(
      `DELETE FROM Registrations WHERE RegistrationID = ?`,
      [regId]
    );
    if (res.affectedRows === 0) {
      throw new Error(`Registration #${regId} not found.`);
    }
    return { RegistrationID: regId };
  }

  const data = readLocalData();
  const index = data.Registrations.findIndex(r => Number(r.RegistrationID) === regId);
  if (index === -1) {
    throw new Error(`Registration #${regId} not found.`);
  }

  const removed = data.Registrations.splice(index, 1)[0];
  writeLocalData(data);
  return removed;
}

// Stats Overview
export async function getStats() {
  const courses = await getCourses();
  const students = await getStudents();
  const registrations = await getRegistrations();

  const totalCapacity = courses.reduce((sum, c) => sum + (c.Capacity || 30), 0);
  const totalEnrolled = registrations.length;
  const fillRate = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  return {
    totalCourses: courses.length,
    totalStudents: students.length,
    totalRegistrations: registrations.length,
    fillRate: `${fillRate}%`,
    recentRegistrations: registrations.slice(0, 5)
  };
}
