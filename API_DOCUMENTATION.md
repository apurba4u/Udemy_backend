# Udemy Clone API Documentation

Base URL: `http://localhost:5001/api`

## Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

Or via cookie named `token`.

---

## Auth Endpoints

### Register
```
POST /api/auth/register
Body: { fullName, email, password }
```

### Login
```
POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

### Logout
```
POST /api/auth/logout
```

### Get Current User
```
GET /api/auth/me
```

### Update Profile
```
PUT /api/auth/profile
Body: { fullName, phone, avatar }
```

### Change Password
```
PUT /api/auth/password
Body: { currentPassword, newPassword }
```

### Forgot Password
```
POST /api/auth/forgot-password
Body: { email }
```

### Reset Password
```
POST /api/auth/reset-password
Body: { token, password }
```

### Google Login
```
POST /api/auth/google
Body: { email, fullName, avatar }
```

---

## Course Endpoints

### Get All Courses (Public)
```
GET /api/courses?category=&level=&search=&page=&limit=&sort=
```

### Get Course by Slug
```
GET /api/courses/slug/:slug
```

### Get Featured Courses
```
GET /api/courses/featured
```

### Create Course (Admin)
```
POST /api/courses
Body: { title, description, price, thumbnail, category, ... }
```

### Update Course (Admin)
```
PUT /api/courses/:id
Body: { title, description, ... }
```

### Delete Course (Admin)
```
DELETE /api/courses/:id
```

### Publish/Unpublish Course (Admin)
```
PUT /api/courses/:id/publish
PUT /api/courses/:id/unpublish
```

---

## Category Endpoints

### Get All Categories
```
GET /api/categories
```

### Create Category (Admin)
```
POST /api/categories
Body: { name, description, icon, image }
```

### Update Category (Admin)
```
PUT /api/categories/:id
Body: { name, description, icon, image, active, featured }
```

### Delete Category (Admin)
```
DELETE /api/categories/:id
```

---

## Checkout Endpoints

### Validate Coupon
```
POST /api/checkout/validate-coupon
Body: { code, courseId }
Response: { coupon, originalPrice, discount, finalPrice }
```

### Create Order
```
POST /api/checkout/create-order
Body: { courseId, couponCode, gatewayId }
Response: { order, gateway }
```

### Submit Manual Payment
```
POST /api/checkout/submit-payment
Body: { orderId, senderNumber, transactionId, screenshot }
```

### Get My Orders
```
GET /api/checkout/orders
```

---

## Learning Endpoints

### Get Progress
```
GET /api/learning/progress/:courseId
```

### Mark Lesson Complete
```
PUT /api/learning/progress/:courseId/lesson/:lessonId
```

### Get Course Sections
```
GET /api/learning/sections/:courseId
```

### Get Learning Analytics
```
GET /api/learning/analytics
```

---

## Notes Endpoints

### Get Notes by Lesson
```
GET /api/notes/lesson/:lessonId
```

### Create Note
```
POST /api/notes
Body: { lessonId, courseId, content, timestamp }
```

### Update Note
```
PUT /api/notes/:id
Body: { content }
```

### Delete Note
```
DELETE /api/notes/:id
```

---

## Bookmark Endpoints

### Add Bookmark
```
POST /api/bookmarks
Body: { lessonId, courseId, timestamp }
```

### Remove Bookmark
```
DELETE /api/bookmarks/lesson/:lessonId
```

### Get Bookmarks by Course
```
GET /api/bookmarks/course/:courseId
```

---

## Admin Endpoints

### Dashboard Stats
```
GET /api/admin/dashboard
```

### Get All Users
```
GET /api/admin/users?page=&limit=&role=&search=
```

### Update User Role
```
PUT /api/admin/users/:id/role
Body: { role }
```

### Delete User
```
DELETE /api/admin/users/:id
```

### Get Audit Logs
```
GET /api/audit-logs?page=&limit=&action=&entity=
```

### Get Revenue Analytics
```
GET /api/orders/analytics/revenue
```

### Export Users
```
GET /api/exports/users?format=csv
```

---

## Payment Gateway Endpoints

### Get All Gateways
```
GET /api/payment-gateways
```

### Toggle Gateway
```
PUT /api/payment-gateways/:id/toggle
```

### Update Gateway
```
PUT /api/payment-gateways/:id
Body: { enabled, configuration, instructions }
```

---

## Coupon Endpoints

### Get All Coupons (Admin)
```
GET /api/coupons?page=&limit=&search=&active=
```

### Create Coupon (Admin)
```
POST /api/coupons
Body: { code, type, value, usageLimit, expiresAt, ... }
```

### Update Coupon (Admin)
```
PUT /api/coupons/:id
Body: { code, type, value, ... }
```

### Delete Coupon (Admin)
```
DELETE /api/coupons/:id
```

---

## Testimonial Endpoints

### Get Testimonials (Public)
```
GET /api/testimonials
```

### Create Testimonial (Admin)
```
POST /api/testimonials
Body: { name, designation, review, rating, ... }
```

---

## Blog Endpoints

### Get Published Blogs
```
GET /api/blogs/published?page=&limit=&search=&category=
```

### Get Blog by Slug
```
GET /api/blogs/slug/:slug
```

### Create Blog (Admin)
```
POST /api/blogs
Body: { title, content, excerpt, thumbnail, ... }
```

---

## FAQ Endpoints

### Get FAQs (Public)
```
GET /api/faqs
```

### Create FAQ (Admin)
```
POST /api/faqs
Body: { question, answer, category }
```

---

## Contact Message Endpoints

### Submit Contact Message
```
POST /api/contact-messages
Body: { name, email, subject, message }
```

### Get All Messages (Admin)
```
GET /api/contact-messages?page=&limit=&read=
```

---

## Website Settings Endpoints

### Get Settings
```
GET /api/settings
```

### Update Settings (Admin)
```
PUT /api/settings
Body: { logo, contact, socialLinks, footer, seo }
```

---

## Notification Endpoints

### Get My Notifications
```
GET /api/notifications?page=&limit=&read=
```

### Mark as Read
```
PUT /api/notifications/:id/read
```

### Mark All as Read
```
PUT /api/notifications/read-all
```

---

## Health Check
```
GET /api/health
Response: { success, message, timestamp, environment }
```
