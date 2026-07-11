export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
}

export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum CourseLanguage {
  ENGLISH = 'English',
  BANGLA = 'Bangla',
  HINDI = 'Hindi',
  SPANISH = 'Spanish',
}

export enum PaymentStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  REFUNDED = 'Refunded',
}

export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum PaymentGatewayType {
  STRIPE = 'stripe',
  BKASH = 'bkash',
  NAGAD = 'nagad',
  PAYPAL = 'paypal',
  SSLCOMMERZ = 'sslcommerz',
  RAZORPAY = 'razorpay',
}

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum NotificationType {
  ENROLLMENT = 'enrollment',
  PAYMENT = 'payment',
  COURSE = 'course',
  SYSTEM = 'system',
}

export enum AuditAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  PUBLISH = 'unpublish',
  UNPUBLISH = 'unpublish',
  APPROVE = 'approve',
  REJECT = 'reject',
  BLOCK = 'block',
  UNBLOCK = 'unblock',
}
