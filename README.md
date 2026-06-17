# CodeArena

CodeArena is a full-stack online coding platform inspired by LeetCode and HackerRank, built as an internship project. It allows users to solve algorithmic problems, submit code in multiple languages, receive automated verdicts from a custom judge engine, compete in timed contests with scoring and rankings, and track their progress on a leaderboard.

## Features

- JWT-based authentication with role-based access (User / Admin)
- Problem library with search, filters, and difficulty levels
- Online code editor (Monaco Editor) supporting Java, Python, C++, and JavaScript
- Custom judge engine that compiles and runs code against hidden test cases
- Verdicts: Accepted, Wrong Answer, Time Limit Exceeded, Runtime Error, Compilation Error
- User profiles with submission history, solved problems, acceptance rate, and contest performance
- Global leaderboard with rankings (admins excluded)
- Timed contests with countdown timers
- Points-based contest scoring (Easy = 100, Medium = 200, Hard = 300)
- Dedicated contest problem-solving page with copy/paste disabled
- Contest scoreboard with rankings based on score and submission time (admins excluded)
- Admin panel for managing users, problems, contests, submissions, and support tickets
- Account activation and deactivation with proper session enforcement
- Contact Support system — users and guests can submit tickets, admins manage and resolve them
- Account settings for updating profile details and changing password
- Animated landing page with feature overview
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
│       ├── support/
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

- USER: solve problems, submit code, view leaderboard, join contests, manage own profile, contact support
- ADMIN: all management capabilities through the admin panel — users, problems, contests, submissions, and support tickets

To promote a user to admin, run in MySQL:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'user@example.com';
```

## Account Management

Admins can activate or deactivate user accounts from the Admin Panel.

- Deactivated users cannot log in and receive a clear error message
- If a user is deactivated while already logged in, their session is invalidated immediately on the next request
- Admins cannot deactivate themselves or other admin accounts
- Deactivated users can still submit a support ticket from the login page to appeal

## Judge Engine

The judge engine evaluates submitted code as follows:

1. Code is written to a temporary, uniquely-named file
2. Code is compiled (Java/C++) or run directly (Python/JavaScript) using ProcessBuilder
3. The program is run against each hidden test case with input passed through stdin
4. Output is compared with the expected output
5. Time limits are enforced; slow processes are terminated
6. A verdict is returned: Accepted, Wrong Answer, Time Limit Exceeded, Compilation Error, Runtime Error, or Memory Limit Exceeded
7. Temporary files are deleted after judging

## Contests and Scoring

Contests group a set of problems within a start and end time window.

- Each problem carries points based on its difficulty: Easy = 100, Medium = 200, Hard = 300
- During an ongoing contest, problems are solved through a dedicated contest page where copy, paste, cut, and right-click are disabled
- A submission only counts toward a contest if it is made through the contest page while the contest is ongoing
- A user's contest score is the sum of points for each problem they get Accepted on (only the first Accepted submission per problem counts)
- The contest scoreboard ranks participants by score, then by earliest last-accepted submission time as a tiebreaker
- Admin accounts are excluded from both the global leaderboard and contest scoreboards
- User profiles show a Contest Performance section summarizing score and problems solved per contest

## Support System

- Any user (including guests and deactivated users) can submit a support ticket from the login page
- Logged-in users (non-admin) can submit tickets via the Contact Support option in the navbar
- Admins manage all tickets in the Admin Panel under the Support tab
- Tickets can be filtered by status (Open / Resolved)
- The sidebar shows a live count of open tickets
- Admins can mark tickets as resolved

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register a new user |
| POST | /api/v1/auth/login | Login and receive JWT |
| GET | /api/v1/problems | List problems |
| POST | /api/v1/submissions | Submit code for judging |
| GET | /api/v1/leaderboard | Get leaderboard |
| GET | /api/v1/contests | List contests |
| GET | /api/v1/contests/{id} | Get contest details |
| POST | /api/v1/contests/{id}/join | Join a contest |
| GET | /api/v1/contests/{id}/scoreboard | Get contest scoreboard |
| PUT | /api/v1/users/me | Update profile |
| PUT | /api/v1/users/me/password | Change password |
| POST | /api/v1/support | Submit a support ticket (public) |
| GET | /api/v1/support/admin | View all support tickets (admin) |
| PUT | /api/v1/support/admin/{id}/resolve | Resolve a ticket (admin) |
| GET | /api/v1/admin/stats | Admin dashboard stats |
| PUT | /api/v1/admin/users/{id}/deactivate | Deactivate a user (admin) |
| PUT | /api/v1/admin/users/{id}/activate | Activate a user (admin) |