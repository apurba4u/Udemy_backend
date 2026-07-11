import { AuditLog } from '../models/AuditLog.js';
import { AuditAction } from '../types/index.js';
import { Types } from 'mongoose';

interface AuditLogData {
  user?: Types.ObjectId;
  action: AuditAction;
  entity: string;
  entityId?: Types.ObjectId;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

export const createAuditLog = async (data: AuditLogData): Promise<void> => {
  try {
    await AuditLog.create({
      user: data.user,
      action: data.action,
      entity: data.entity,
      entityId: data.entityId,
      details: data.details,
      ipAddress: data.ipAddress,
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

export const getAuditLogs = async (
  filters: {
    user?: Types.ObjectId;
    action?: AuditAction;
    entity?: string;
    startDate?: Date;
    endDate?: Date;
  },
  page: number = 1,
  limit: number = 50
) => {
  const query: Record<string, unknown> = {};

  if (filters.user) query.user = filters.user;
  if (filters.action) query.action = filters.action;
  if (filters.entity) query.entity = filters.entity;
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) (query.createdAt as Record<string, Date>).$gte = filters.startDate;
    if (filters.endDate) (query.createdAt as Record<string, Date>).$lte = filters.endDate;
  }

  const total = await AuditLog.countDocuments(query);
  const logs = await AuditLog.find(query)
    .populate('user', 'fullName email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
