import { Request, Response, NextFunction } from 'express';
import { Category } from '../models/Category.js';
import { AppError } from '../middleware/errorHandler.js';
import { uploadImage } from '../utils/imageUpload.js';
import { createAuditLog } from '../services/audit.service.js';
import { AuditAction } from '../types/index.js';

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, icon, image, featured, active } = req.body;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      throw new AppError('Category already exists', 400);
    }

    let imageUrl = image;
    if (image && image.startsWith('data:')) {
      imageUrl = await uploadImage(image);
    }

    const category = await Category.create({
      name,
      description,
      icon,
      image: imageUrl,
      featured: featured || false,
      active: active !== false,
    });

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.CREATE,
      entity: 'Category',
      entityId: category._id,
      details: { name: category.name },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await Category.find({ active: true }).sort('name');

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await Category.find().sort('name');

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, icon, image, featured, active } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    let imageUrl = image;
    if (image && image.startsWith('data:') && image !== category.image) {
      imageUrl = await uploadImage(image);
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, icon, image: imageUrl, featured, active },
      { new: true, runValidators: true }
    );

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.UPDATE,
      entity: 'Category',
      entityId: category._id,
      details: { name: updatedCategory?.name },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    await category.deleteOne();

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.DELETE,
      entity: 'Category',
      entityId: category._id,
      details: { name: category.name },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const toggleCategoryActive = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    category.active = !category.active;
    await category.save();

    res.status(200).json({
      success: true,
      message: `Category ${category.active ? 'activated' : 'deactivated'} successfully`,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleCategoryFeatured = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    category.featured = !category.featured;
    await category.save();

    res.status(200).json({
      success: true,
      message: `Category ${category.featured ? 'featured' : 'unfeatured'} successfully`,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};
