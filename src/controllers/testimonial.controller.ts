import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../middleware/errorHandler.js';
import { uploadImage } from '../utils/imageUpload.js';
import { createAuditLog } from '../services/audit.service.js';
import { AuditAction } from '../types/index.js';

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  company: { type: String },
  photo: { type: String },
  review: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export const createTestimonial = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, designation, company, photo, review, rating } = req.body;

    let photoUrl = photo;
    if (photo && photo.startsWith('data:')) {
      photoUrl = await uploadImage(photo);
    }

    const existingCount = await Testimonial.countDocuments();
    const testimonial = await Testimonial.create({
      name,
      designation,
      company,
      photo: photoUrl,
      review,
      rating,
      order: existingCount + 1,
    });

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.CREATE,
      entity: 'Testimonial',
      entityId: testimonial._id,
      details: { name },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: testimonial,
    });
  } catch (error) {
    next(error);
  }
};

export const getTestimonials = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const testimonials = await Testimonial.find({ active: true }).sort('order');

    res.status(200).json({
      success: true,
      message: 'Testimonials retrieved successfully',
      data: testimonials,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTestimonials = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const testimonials = await Testimonial.find().sort('order');

    res.status(200).json({
      success: true,
      message: 'Testimonials retrieved successfully',
      data: testimonials,
    });
  } catch (error) {
    next(error);
  }
};

export const getTestimonialById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      throw new AppError('Testimonial not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Testimonial retrieved successfully',
      data: testimonial,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTestimonial = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, designation, company, photo, review, rating, active } = req.body;

    let photoUrl = photo;
    if (photo && photo.startsWith('data:')) {
      photoUrl = await uploadImage(photo);
    }

    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { name, designation, company, photo: photoUrl, review, rating, active },
      { new: true, runValidators: true }
    );

    if (!testimonial) {
      throw new AppError('Testimonial not found', 404);
    }

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.UPDATE,
      entity: 'Testimonial',
      entityId: testimonial._id,
      details: { name: testimonial.name },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Testimonial updated successfully',
      data: testimonial,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTestimonial = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

    if (!testimonial) {
      throw new AppError('Testimonial not found', 404);
    }

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.DELETE,
      entity: 'Testimonial',
      entityId: testimonial._id,
      details: { name: testimonial.name },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const toggleTestimonialActive = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      throw new AppError('Testimonial not found', 404);
    }

    testimonial.active = !testimonial.active;
    await testimonial.save();

    res.status(200).json({
      success: true,
      message: `Testimonial ${testimonial.active ? 'activated' : 'deactivated'} successfully`,
      data: testimonial,
    });
  } catch (error) {
    next(error);
  }
};

export const reorderTestimonials = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { testimonialIds } = req.body;

    for (let i = 0; i < testimonialIds.length; i++) {
      await Testimonial.findByIdAndUpdate(testimonialIds[i], { order: i + 1 });
    }

    res.status(200).json({
      success: true,
      message: 'Testimonials reordered successfully',
    });
  } catch (error) {
    next(error);
  }
};
