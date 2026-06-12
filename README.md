# CodeArena

CodeArena is a full-stack online coding platform inspired by LeetCode and HackerRank, built as an internship project. It allows users to solve algorithmic problems, submit code in multiple languages, receive automated verdicts from a custom judge engine, compete in timed contests, and track their progress on a leaderboard.

## Features

- JWT-based authentication with role-based access (User / Admin)
- Problem library with search, filters, and difficulty levels
- Online code editor (Monaco Editor) supporting Java, Python, C++, and JavaScript
- Custom judge engine that compiles and runs code against hidden test cases
- Verdicts: Accepted, Wrong Answer, Time Limit Exceeded, Runtime Error, Compilation Error
- User profiles with submission history, solved problems, and acceptance rate
- Global leaderboard with rankings
- Timed contests with countdown timers
- Admin panel for managing users, problems, contests, and submissions
- Account settings for updating profile details and changing password
- Fully responsive UI

## Tech Stack

**Backend:** Spring Boot 3.5 (Java 21), Spring Security, Spring Data JPA, MySQL 8.0, JWT (jjwt)

**Frontend:** React 18 (Vite), React Router, Axios, Monaco Editor, Lucide Icons, React Hot Toast

## Project Structure

```
codearena/
├── backend/
│   └── src/main/java/com/codearena/backend/
│       ├── auth/
│       ├── user/
│       ├── problem/
│       ├── submission/
│       ├── leaderboard/
│       ├── contest/
│       ├── admin/
│       ├── config/
│       └── common/
│
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── services/
│       ├── context/
│       └── index.css
│
└── README.md
```

## Prerequisites

- Java 21+
- Node.js 18+
- MySQL 8.0
- Maven 3.9+

## Setup

### 1. Clone the repository

```
git clone https://github.com/Asifkarim683/codearena.git
cd codearena
```

### 2. Create the database

```sql
CREATE DATABASE codearena;
```

### 3. Configure the backend

Edit `backend/src/main/resources/application.properties` and set your MySQL password:

```
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### 4. Run the backend

```
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
```

Backend runs on http://localhost:8090
Health check: http://localhost:8090/actuator/health

### 5. Run the frontend

```
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

## Roles

- USER: solve problems, submit code, view leaderboard, join contests, manage own profile
- ADMIN: all user capabilities plus manage users, problems, and contests through the admin panel

To promote a user to admin, run in MySQL:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'user@example.com';
```

## Judge Engine

The judge engine evaluates submitted code as follows:

1. Code is written to a temporary, uniquely-named file
2. Code is compiled (Java/C++) or run directly (Python/JavaScript) using ProcessBuilder
3. The program is run against each hidden test case with input passed through stdin
4. Output is compared with the expected output
5. Time limits are enforced; slow processes are terminated
6. A verdict is returned: Accepted, Wrong Answer, Time Limit Exceeded, Compilation Error, Runtime Error, or Memory Limit Exceeded
7. Temporary files are deleted after judging

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register a new user |
| POST | /api/v1/auth/login | Login and receive JWT |
| GET | /api/v1/problems | List problems |
| POST | /api/v1/submissions | Submit code for judging |
| GET | /api/v1/leaderboard | Get leaderboard |
| GET | /api/v1/contests | List contests |
| PUT | /api/v1/users/me | Update profile |
| PUT | /api/v1/users/me/password | Change password |
| GET | /api/v1/admin/stats | Admin dashboard stats |

## Contributors

This project was built as part of an internship program.