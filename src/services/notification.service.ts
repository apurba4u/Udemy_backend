import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { NotificationType } from '../types/index.js';
import { Types } from 'mongoose';

interface CreateNotificationParams {
  user: Types.ObjectId | string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export const createNotification = async (data: CreateNotificationParams): Promise<void> => {
  try {
    await Notification.create({
      user: data.user,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link || undefined,
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

export const notifyStudentPaymentSubmitted = async (
  studentId: Types.ObjectId | string,
  courseName: string,
  gatewayName: string
): Promise<void> => {
  await createNotification({
    user: studentId,
    type: NotificationType.PAYMENT,
    title: 'Payment Submitted',
    message: `Your payment for "${courseName}" via ${gatewayName} has been submitted and is awaiting verification.`,
    link: '/dashboard/student/my-learning',
  });
};

export const notifyStudentPaymentApproved = async (
  studentId: Types.ObjectId | string,
  courseName: string
): Promise<void> => {
  await createNotification({
    user: studentId,
    type: NotificationType.PAYMENT,
    title: 'Payment Approved',
    message: `Your payment for "${courseName}" has been approved. You now have access to the course.`,
    link: '/dashboard/student/my-learning',
  });
};

export const notifyStudentPaymentRejected = async (
  studentId: Types.ObjectId | string,
  courseName: string,
  reason: string
): Promise<void> => {
  await createNotification({
    user: studentId,
    type: NotificationType.PAYMENT,
    title: 'Payment Rejected',
    message: `Your payment for "${courseName}" was rejected. Reason: ${reason}`,
    link: '/dashboard/student/my-learning',
  });
};

export const notifyAdminNewPayment = async (
  studentName: string,
  courseName: string,
  gatewayName: string,
  amount: number
): Promise<void> => {
  try {
    const admins = await User.find({ role: 'admin' as any });
    for (const admin of admins) {
      await createNotification({
        user: admin._id,
        type: NotificationType.PAYMENT,
        title: 'New Payment Submitted',
        message: `${studentName} submitted a ${gatewayName} payment of $${amount} for "${courseName}".`,
        link: '/dashboard/admin/payments',
      });
    }
  } catch (error) {
    console.error('Failed to notify admins:', error);
  }
};

export const notifyStudentCourseCompleted = async (
  studentId: Types.ObjectId | string,
  courseName: string
): Promise<void> => {
  await createNotification({
    user: studentId,
    type: NotificationType.SYSTEM,
    title: 'Course Completed',
    message: `Congratulations! You have completed "${courseName}".`,
    link: '/dashboard/student/my-learning',
  });
};

export const notifyAdminNewUser = async (
  userName: string,
  userEmail: string
): Promise<void> => {
  try {
    const admins = await User.find({ role: 'admin' as any });
    for (const admin of admins) {
      await createNotification({
        user: admin._id,
        type: NotificationType.SYSTEM,
        title: 'New User Registration',
        message: `${userName} (${userEmail}) has registered on the platform.`,
        link: '/dashboard/admin/users',
      });
    }
  } catch (error) {
    console.error('Failed to notify admins:', error);
  }
};

export const notifyAdminNewReview = async (
  studentName: string,
  courseName: string,
  rating: number
): Promise<void> => {
  try {
    const admins = await User.find({ role: 'admin' as any });
    for (const admin of admins) {
      await createNotification({
        user: admin._id,
        type: NotificationType.SYSTEM,
        title: 'New Review',
        message: `${studentName} left a ${rating}-star review on "${courseName}".`,
        link: '/dashboard/admin/courses',
      });
    }
  } catch (error) {
    console.error('Failed to notify admins:', error);
  }
};

export const notifyNewCoupon = async (
  couponCode: string,
  discountValue: number,
  discountType: string
): Promise<void> => {
  try {
    const students = await User.find({ role: 'student' as any });
    for (const student of students) {
      await createNotification({
        user: student._id,
        type: NotificationType.COUPON,
        title: 'New Coupon Available',
        message: `Use code "${couponCode}" for ${discountType === 'percentage' ? discountValue + '%' : '$' + discountValue} off!`,
        link: '/courses',
      });
    }
  } catch (error) {
    console.error('Failed to notify students:', error);
  }
};
