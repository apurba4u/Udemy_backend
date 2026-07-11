import { Request, Response, NextFunction } from 'express';
import { Coupon } from '../models/Coupon.js';
import { CouponUsage } from '../models/CouponUsage.js';
import { AppError } from '../middleware/errorHandler.js';
import { createAuditLog } from '../services/audit.service.js';
import { AuditAction } from '../types/index.js';
import { paginate } from '../utils/pagination.js';

export const createCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      code,
      type,
      value,
      minimumPurchase,
      maximumDiscount,
      usageLimit,
      perUserLimit,
      expiresAt,
      active,
    } = req.body;

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      throw new AppError('Coupon code already exists', 400);
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      value,
      minimumPurchase,
      maximumDiscount,
      usageLimit,
      perUserLimit: perUserLimit || 1,
      expiresAt,
      active: active !== false,
    });

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.CREATE,
      entity: 'Coupon',
      entityId: coupon._id,
      details: { code: coupon.code, type: coupon.type },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const getCoupons = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, sort, search, active, type } = req.query;

    const query = Coupon.find();

    if (search) {
      query.where('code').regex(new RegExp(search as string, 'i'));
    }

    if (active !== undefined) {
      query.where('active').equals(active === 'true');
    }

    if (type) {
      query.where('type').equals(type as string);
    }

    const result = await paginate(query, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      sort: (sort as string) || '-createdAt',
    });

    res.status(200).json({
      success: true,
      message: 'Coupons retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getCouponById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }

    const usageCount = await CouponUsage.countDocuments({ coupon: coupon._id });

    res.status(200).json({
      success: true,
      message: 'Coupon retrieved successfully',
      data: { ...coupon.toObject(), usageCount },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      code,
      type,
      value,
      minimumPurchase,
      maximumDiscount,
      usageLimit,
      perUserLimit,
      expiresAt,
      active,
    } = req.body;

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }

    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (existingCoupon) {
        throw new AppError('Coupon code already exists', 400);
      }
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      {
        code: code?.toUpperCase(),
        type,
        value,
        minimumPurchase,
        maximumDiscount,
        usageLimit,
        perUserLimit,
        expiresAt,
        active,
      },
      { new: true, runValidators: true }
    );

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.UPDATE,
      entity: 'Coupon',
      entityId: coupon._id,
      details: { code: updatedCoupon?.code },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: updatedCoupon,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.DELETE,
      entity: 'Coupon',
      entityId: coupon._id,
      details: { code: coupon.code },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const toggleCouponActive = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }

    coupon.active = !coupon.active;
    await coupon.save();

    res.status(200).json({
      success: true,
      message: `Coupon ${coupon.active ? 'activated' : 'deactivated'} successfully`,
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const duplicateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }

    const newCoupon = await Coupon.create({
      code: `${coupon.code}-COPY`,
      type: coupon.type,
      value: coupon.value,
      minimumPurchase: coupon.minimumPurchase,
      maximumDiscount: coupon.maximumDiscount,
      usageLimit: coupon.usageLimit,
      perUserLimit: coupon.perUserLimit,
      expiresAt: coupon.expiresAt,
      active: false,
    });

    res.status(201).json({
      success: true,
      message: 'Coupon duplicated successfully',
      data: newCoupon,
    });
  } catch (error) {
    next(error);
  }
};

export const getCouponAnalytics = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ active: true });
    const expiredCoupons = await Coupon.countDocuments({
      expiresAt: { $lt: new Date() },
    });

    const usageStats = await CouponUsage.aggregate([
      {
        $group: {
          _id: '$coupon',
          totalUses: { $sum: 1 },
          totalDiscount: { $sum: '$discountAmount' },
        },
      },
      {
        $lookup: {
          from: 'coupons',
          localField: '_id',
          foreignField: '_id',
          as: 'coupon',
        },
      },
      { $unwind: '$coupon' },
      { $sort: { totalUses: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      success: true,
      message: 'Coupon analytics retrieved successfully',
      data: {
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        mostUsedCoupons: usageStats,
      },
    });
  } catch (error) {
    next(error);
  }
};
