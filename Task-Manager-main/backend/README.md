# Team Task Manager - Backend API

A full-stack REST API for team task management with role-based access control (Admin/Member).

## Tech Stack

- **Framework:** Express.js with Node.js
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs

## Prerequisites

- Node.js 18+
- PostgreSQL database (or Supabase)
- npm or yarn package manager

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
# Local PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/task_manager"

# Or Supabase Session pooler (recommended for local Prisma + IPv4 networks)
# DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"
JWT_SECRET="your_jwt_secret_key_change_this_in_production"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

## Database Setup

1. Generate Prisma client:
```bash
npm run prisma:generate
```

2. Create database and run migrations:
```bash
npm run prisma:migrate
```

3. (Optional) Push schema to database without migrations:
```bash
npm run prisma:push
```

### Supabase note

If you use Supabase and see `P1001: Can't reach database server`, verify the host in `DATABASE_URL` first.

- `db.<project-ref>.supabase.co:5432` is a direct connection host and must resolve correctly.
- Supabase direct database hosts use IPv6 by default, so local IPv4-only networks should use the Supavisor Session pooler host instead.
- The safest source of truth is the **Connect** button in your Supabase project dashboard. Copy the connection string from there instead of reusing an old sample value.

## Development

Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (requires token)

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project (Admin only)
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project (Admin only)
- `DELETE /api/projects/:id` - Delete project (Admin only)

### Team Members
- `GET /api/projects/:projectId/members` - List project members
- `POST /api/projects/:projectId/members` - Add team member (Admin only)
- `DELETE /api/projects/:projectId/members/:userId` - Remove member (Admin only)
- `GET /api/projects/:projectId/available-users` - List available users to add

### Tasks
- `GET /api/projects/:projectId/tasks` - List project tasks
- `POST /api/projects/:projectId/tasks` - Create new task
- `GET /api/tasks/:taskId` - Get task details
- `PUT /api/tasks/:taskId` - Update task
- `PATCH /api/tasks/:taskId/status` - Update task status
- `DELETE /api/tasks/:taskId` - Delete task

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard overview with stats

## Authentication

All protected endpoints require an `Authorization` header with a JWT token:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are obtained from the `/api/auth/login` or `/api/auth/signup` endpoints.

## Database Schema

### Users Table
- `id` - Unique identifier (CUID)
- `email` - User email (unique)
- `password` - Hashed password
- `name` - User full name
- `role` - User role (ADMIN/MEMBER)
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Projects Table
- `id` - Unique identifier
- `name` - Project name
- `description` - Project description
- `adminId` - Admin user ID (FK)
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### TeamMembers Table
- `id` - Unique identifier
- `projectId` - Project ID (FK)
- `userId` - User ID (FK)
- `role` - Member role (ADMIN/MEMBER)
- `joinedAt` - Timestamp

### Tasks Table
- `id` - Unique identifier
- `projectId` - Project ID (FK)
- `title` - Task title
- `description` - Task description
- `status` - Task status (TODO/IN_PROGRESS/DONE)
- `priority` - Task priority (LOW/MEDIUM/HIGH/URGENT)
- `assignedTo` - User ID (FK) - nullable
- `createdBy` - User ID (FK)
- `dueDate` - Due date - nullable
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### TaskHistory Table
- `id` - Unique identifier
- `taskId` - Task ID (FK)
- `changedBy` - User ID (FK)
- `changeType` - Type of change
- `oldValue` - Previous value
- `newValue` - New value
- `timestamp` - Timestamp

## Error Handling

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Error details"
}
```

## Deployment

### Railway Deployment

1. Create a Railway project and connect your GitHub repository
2. Add PostgreSQL addon (Supabase recommended for better control)
3. Set environment variables in Railway dashboard:
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - Secure JWT secret
   - `NODE_ENV` - "production"
   - `FRONTEND_URL` - Your frontend URL

4. Railway will automatically run `npm start` as the start command

## Security Considerations

1. **Password Hashing:** Passwords are hashed using bcryptjs with 10 salt rounds
2. **JWT Tokens:** Tokens expire after 7 days
3. **CORS:** Configured to only accept requests from the specified FRONTEND_URL
4. **Input Validation:** All inputs are validated before processing
5. **SQL Injection Prevention:** Using Prisma ORM prevents SQL injection

## Environment Variables

See `.env.example` for all required environment variables.

## Support

For issues or questions, please check the main project README or contact the development team.
