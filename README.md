# Udemy Clone - Backend API

Production-ready REST API for the Enterprise Learning Management System (LMS).

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Authentication:** Better Auth + JWT
- **Security:** Helmet, CORS, Rate Limiting, Input Validation

## Features

- **Authentication:** Email/Password, Google OAuth, JWT sessions
- **Authorization:** Role-based access control (Admin, Student)
- **Course Management:** CRUD, Sections, Lessons, Publishing
- **Payment Processing:** Stripe, Manual bKash/Nagad
- **Learning Experience:** Progress tracking, Notes, Bookmarks
- **Admin Dashboard:** Analytics, User Management, CMS, Exports
- **Security:** Rate limiting, Input sanitization, Audit logging

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

See `.env.example` for required variables.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Courses
- `GET /api/courses` - List courses
- `GET /api/courses/:id` - Get course
- `POST /api/courses` - Create course (Admin)
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category (Admin)

### Checkout
- `POST /api/checkout/validate-coupon` - Validate coupon
- `POST /api/checkout/create-order` - Create order
- `POST /api/checkout/submit-payment` - Submit payment

### Learning
- `GET /api/learning/progress/:courseId` - Get progress
- `PUT /api/learning/progress/:courseId/lesson/:lessonId` - Mark lesson complete

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - List users
- `GET /api/admin/courses` - List courses

## Demo Credentials

**Admin:**
- Email: admin@udemy.com
- Password: @Admin3124

**Student:**
- Email: student@demo.com
- Password: @Student123

## License

MIT
