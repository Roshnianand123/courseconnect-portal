# CourseConnect – Student Course Registration Portal

![CourseConnect Portal](https://img.shields.io/badge/CourseConnect-v1.0.0-indigo.svg)
![React](https://img.shields.io/badge/React-18.3-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Compatible-336791.svg)
![MySQL](https://img.shields.io/badge/MySQL-Compatible-4479A1.svg)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF.svg)
![Deployment](https://img.shields.io/badge/Deploy-Vercel-black.svg)

CourseConnect is a full-stack, responsive web application designed for universities and academic institutions where students can view available courses, browse enrollment limits and course durations, register for courses, and manage their academic schedules in real time.

---

## Key Features

1. **Display Available Courses**:
   - Live grid of courses with Course ID, Course Name, Duration, Department, and Faculty Instructor.
   - Real-time seat availability indicator (`Available`, `Low Seats`, or `Course Full`).
   - Dynamic search by course title, code, or instructor, with department filters.

2. **Add / Register a Student**:
   - Register new learners with Name, University Email, and custom or auto-generated Student ID.
   - Real-time email validation and duplicate checking.

3. **Register a Student for a Course**:
   - Guided registration dialog with dynamic preview of course duration and department.
   - Prevents duplicate registrations (cannot register the same student for the same course twice).
   - Prevents enrollment in full courses.
   - Interactive confetti celebration animation upon successful enrollment.

4. **View Registered Students**:
   - Searchable and filterable master registrations roster.
   - Filter enrollments by Course or by Student.
   - Displays Student ID, Name, Email, Course ID, Course Name, Duration, and Enrollment Date.

5. **Remove a Registration**:
   - Safe registration drop with confirmation modal.
   - Instantly frees up the seat and returns it to the course availability pool.

6. **Responsive, Modern Aesthetics**:
   - Vanilla CSS design system with glassmorphic cards, luminous ambient glow, and Google Font `Plus Jakarta Sans`.
   - Live campus metrics dashboard (Total Courses, Total Students, Active Registrations, Seat Fill Rate).

---

## Database Architecture

CourseConnect supports both **PostgreSQL** and **MySQL**, with automatic zero-configuration fallback for instant local development.

### Database Tables

#### 1. `Students` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `StudentID` | `VARCHAR(50)` | `PRIMARY KEY` | Unique Student Identifier (e.g. `STU-1001`) |
| `Name` | `VARCHAR(255)` | `NOT NULL` | Full student name |
| `Email` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | Student email address |
| `CreatedAt` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Profile creation timestamp |

#### 2. `Courses` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `CourseID` | `VARCHAR(50)` | `PRIMARY KEY` | Course code (e.g. `CS-101`, `WD-301`) |
| `CourseName` | `VARCHAR(255)` | `NOT NULL` | Official course title |
| `Duration` | `VARCHAR(100)` | `NOT NULL` | Course duration (e.g. `12 Weeks`, `8 Weeks`) |
| `Department` | `VARCHAR(100)` | Default: `'Computer Science'` | Academic department |
| `Instructor` | `VARCHAR(255)` | Default: `'Faculty Staff'` | Course instructor |
| `Capacity` | `INT` | Default: `30` | Maximum student capacity |
| `Description` | `TEXT` | Nullable | Syllabus overview |

#### 3. `Registrations` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `RegistrationID` | `INT / SERIAL` | `PRIMARY KEY` | Auto-incrementing registration identifier |
| `StudentID` | `VARCHAR(50)` | `FOREIGN KEY (Students)` | Enrolled student ID |
| `CourseID` | `VARCHAR(50)` | `FOREIGN KEY (Courses)` | Enrolled course ID |
| `RegisteredAt` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Date and time of registration |
| *(Constraint)* | `UNIQUE` | `(StudentID, CourseID)` | Prevents duplicate student registrations |

---

## Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18 or higher (v20+ recommended)
- **Git**

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> [!TIP]
> By default, the portal starts immediately with an embedded relational store pre-seeded with sample courses, students, and registrations. No database installation is required for testing!

---

## Connecting to MySQL or PostgreSQL

To connect to a live **PostgreSQL** (Neon, Supabase, Vercel Postgres, or local) or **MySQL** instance:

1. Create a `.env.local` file:
```bash
cp .env.example .env.local
```

2. Add your database connection URL:

**For PostgreSQL (e.g. Neon or Supabase):**
```env
DATABASE_URL="postgres://username:password@ep-sample-pool.neon.tech/neondb?sslmode=require"
```

**For MySQL (e.g. PlanetScale, Railway, or Local):**
```env
DATABASE_URL="mysql://username:password@localhost:3306/courseconnect"
```

3. Initialize the schema using the scripts provided in the `/db` directory:
- **PostgreSQL**: Run the SQL commands in `db/schema-postgres.sql` and `db/seed.sql`
- **MySQL**: Run the SQL commands in `db/schema-mysql.sql` and `db/seed.sql`

---

## Source Control with Git & Pushing to GitHub

Follow these steps to initialize Git and push the project to your GitHub repository:

```bash
# 1. Initialize Git repository
git init

# 2. Add all project files
git add .

# 3. Create your first commit
git commit -m "feat: initial commit for CourseConnect Student Course Registration Portal"

# 4. Create a new repository on GitHub (e.g. https://github.com/YOUR_USERNAME/CourseConnect)

# 5. Link local repository to your GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/CourseConnect.git

# 6. Rename branch to main (if not already)
git branch -M main

# 7. Push source code to GitHub
git push -u origin main
```

---

## GitHub Actions CI/CD Pipeline

The repository includes a ready-to-run GitHub Actions CI/CD workflow located at `.github/workflows/ci-cd.yml`.

Whenever code is pushed or a pull request is opened to the `main` or `master` branch, GitHub Actions will automatically:
1. Check out the latest code.
2. Set up Node.js 20.x with npm dependency caching.
3. Install all dependencies cleanly (`npm ci`).
4. Run Next.js code analysis and linting (`npm run lint`).
5. Compile and test the production application bundle (`npm run build`).

---

## Deploying to Vercel

CourseConnect is optimized for 1-click deployment on [Vercel](https://vercel.com).

### Method 1: Deploy via GitHub (Recommended)
1. Push your code to GitHub following the Git instructions above.
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your **CourseConnect** GitHub repository.
4. (Optional) In the **Environment Variables** section, add:
   - `DATABASE_URL`: Your PostgreSQL (Neon / Supabase / Vercel Postgres) connection string.
5. Click **Deploy**. Vercel will build and assign you a live HTTPS URL in under a minute!

### Method 2: Deploy using Vercel CLI
```bash
npm i -g vercel
vercel
```

---

## API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/courses` | List all courses with enrolled counts and seat statuses |
| `POST` | `/api/courses` | Create a new academic course |
| `GET` | `/api/students` | List all students with registration counts |
| `POST` | `/api/students` | Register a new student profile |
| `GET` | `/api/registrations` | View all registrations with joined student and course data |
| `POST` | `/api/registrations` | Enroll a student in a course (with duplicate checks) |
| `DELETE`| `/api/registrations/[id]` | Drop/remove a registration by ID |
| `GET` | `/api/stats` | Retrieve campus enrollment statistics and DB status |
