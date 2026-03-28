Task Management System

A full-stack task management application built with **Spring Boot**, **React (Vite)**, **MySQL**, **Docker**, and **GitHub Actions**.

---

## Table of contents

1. [Architecture](#architecture)
2. [Tech Stack](#teck-stack)
3. [Design decisions](#design-decisions)
4. [Feature](#feature)
5. [API reference](#api-reference)
6. [Running locally (without Docker)](#running-locally-without-docker)
7. [Running with Docker Compose](#running-with-docker-compose)
8. [Sample users & quick-start](#sample-users--quick-start)
9. [Known limitations & next steps](#known-limitations--next-steps)

---

## Architecture

```
Browser (React SPA)
       │  HTTP/JSON + Bearer token
       ▼
Spring Boot REST API  ──►  MySQL 8 (taskdb)
  ├── Security layer (JWT filter)
  ├── Controllers  (HTTP ↔ DTO)
  ├── Services     (business rules)
  └── Repositories (JPA / Hibernate)
```

Docker Compose runs three containers on a shared internal network:
`taskmanager-frontend` → `taskmanager-backend` → `taskmanager-db`

---

## Tech stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, Vite, Axios, Tailwind CSS             |
| Backend    | Spring Boot 3.2, Spring Security, JPA/Hibernate |
| Auth       | JWT (JJWT 0.12)                                 |
| Database   | MySQL 8.0                                       |
| Docs       | SpringDoc OpenAPI / Swagger UI                  |
| DevOps     | Docker, Docker Compose, GitHub Actions          |

---

## Design decisions

| Decision | Choice | Rationale |
|---|---|---|
| Auth strategy | Stateless JWT | Works naturally with REST; no session affinity needed |
| First admin | First registered user → ADMIN | Simple bootstrap; document the email used |
| Delete rule | ADMIN only | Prevents accidental data loss by regular users |
| Update rule | Creator OR assignee (USER); any task (ADMIN) | Follows least-privilege; both roles have legitimate need |
| Unassigned tasks | Allowed (`assignedTo` nullable) | Tasks may be created before an owner is known |
| JSON casing | camelCase throughout | Consistent with React/JS conventions |

---

## Features

- User registration & login (JWT authentication)
- Create, update, and delete tasks
- Assign tasks to users
- Role-based access (Admin & User)
- Filter tasks by status

---


## API reference

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | Public | Register. First user → ADMIN, rest → USER |
| POST | `/api/auth/login` | Public | Returns JWT |

### Users — `/api/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users` | ADMIN | List all users |
| GET | `/api/users/{id}` | Any | Get user by ID |
| PATCH | `/api/users/{id}/deactivate` | ADMIN | Soft-deactivate account |
| PATCH | `/api/users/{id}/activate` | ADMIN | Re-activate account |

### Tasks — `/api/tasks`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/tasks` | Any | Create task |
| GET | `/api/tasks` | Any | List tasks (filter: `?status=TODO&assignedTo=1`) |
| GET | `/api/tasks/{id}` | Any | Get task by ID |
| PUT | `/api/tasks/{id}` | Any* | Update task |
| DELETE | `/api/tasks/{id}` | ADMIN | Delete task |

*Update: ADMIN can update any task; USER can only update tasks they created or are assigned to.



## Running locally (without Docker)

### Prerequisites
- Java 17+
- Maven 3.8+
- MySQL 8 running locally (or via Docker: `docker run -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=taskdb mysql:8`)
- Node 20+

### Backend

```bash
cd backend

# Set env vars (or export them in your shell)
export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/taskdb?createDatabaseIfNotExist=true
export SPRING_DATASOURCE_USERNAME=root
export SPRING_DATASOURCE_PASSWORD=root
export JWT_SECRET=dGVhbWZsb3ctc2VjcmV0LWtleS10aGF0LWlzLWxvbmctZW5vdWdoLWZvci1IUzI1Ng==

mvn spring-boot:run
# API ready at http://localhost:8080

```

### Frontend

```bash
cd frontend      
npm install
npm run dev
# App at http://localhost:5173
```

---

## Running with Docker Compose

```bash
# 1. Copy and edit secrets
cp .env.example .env

# 2. Start everything (builds images on first run)
docker compose up --build

# 3. Services available at:
#    Frontend → http://localhost:4173
#    Backend  → http://localhost:8080

# 4. Tear down
docker compose down           # keep data
docker compose down -v        # wipe MySQL volume too
```

---


## Sample users & quick-start

There are no pre-seeded users. Follow these steps after starting the app:

```bash
# 1. Register the admin (first registration always → ADMIN)
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@example.com","password":"admin123"}'

# 2. Register a regular user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"User1","email":"User1@example.com","password":"user123"}'


# 3. Create a task
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Set up CI pipeline","description":"Configure GitHub Actions","assignedToId":2}'

# 4. List tasks filtered by status
curl http://localhost:8080/api/tasks?status=TODO \
  -H "Authorization: Bearer $TOKEN"
```

---

##  Known Limitations & Next Steps

- No pagination implemented
- No search functionality
- No refresh tokens (only access token)
- No audit logs
- CORS open in development
- Only local/Docker deployment

---

## Future Improvements

- Add pagination (`?page=0&size=10`)
- Add full-text search
- Add refresh tokens
- Improve UI/UX
- Deploy to cloud (AWS/GCP)

---
