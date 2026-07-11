import { Request, Response, NextFunction } from 'express';
import { FAQ } from '../models/FAQ.js';
import { AppError } from '../middleware/errorHandler.js';
import { createAuditLog } from '../services/audit.service.js';
import { AuditAction } from '../types/index.js';

export const createFAQ = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { question, answer, category, active } = req.body;

    const existingCount = await FAQ.countDocuments();
    const faq = await FAQ.create({
      question,
      answer,
      category,
      active: active !== false,
      order: existingCount + 1,
    });

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.CREATE,
      entity: 'FAQ',
      entityId: faq._id,
      details: { question: faq.question },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: faq,
    });
  } catch (error) {
    next(error);
  }
};

export const getFAQs = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const faqs = await FAQ.find({ active: true }).sort('order');

    res.status(200).json({
      success: true,
      message: 'FAQs retrieved successfully',
      data: faqs,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllFAQs = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const faqs = await FAQ.find().sort('order');

    res.status(200).json({
      success: true,
      message: 'FAQs retrieved successfully',
      data: faqs,
    });
  } catch (error) {
    next(error);
  }
};

export const getFAQById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      throw new AppError('FAQ not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'FAQ retrieved successfully',
      data: faq,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFAQ = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { question, answer, category, active } = req.body;

    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { question, answer, category, active },
      { new: true, runValidators: true }
    );

    if (!faq) {
      throw new AppError('FAQ not found', 404);
    }

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.UPDATE,
      entity: 'FAQ',
      entityId: faq._id,
      details: { question: faq.question },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'FAQ updated successfully',
      data: faq,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFAQ = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);

    if (!faq) {
      throw new AppError('FAQ not found', 404);
    }

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.DELETE,
      entity: 'FAQ',
      entityId: faq._id,
      details: { question: faq.question },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const toggleFAQActive = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      throw new AppError('FAQ not found', 404);
    }

    faq.active = !faq.active;
    await faq.save();

    res.status(200).json({
      success: true,
      message: `FAQ ${faq.active ? 'activated' : 'deactivated'} successfully`,
      data: faq,
    });
  } catch (error) {
    next(error);
  }
};

export const reorderFAQs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { faqIds } = req.body;

    for (let i = 0; i < faqIds.length; i++) {
      await FAQ.findByIdAndUpdate(faqIds[i], { order: i + 1 });
    }

    res.status(200).json({
      success: true,
      message: 'FAQs reordered successfully',
    });
  } catch (error) {
    next(error);
  }
};
