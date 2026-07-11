import { Request, Response, NextFunction } from 'express';
import { Blog } from '../models/Blog.js';
import { AppError } from '../middleware/errorHandler.js';
import { uploadImage } from '../utils/imageUpload.js';
import { createAuditLog } from '../services/audit.service.js';
import { AuditAction } from '../types/index.js';
import { paginate } from '../utils/pagination.js';

export const createBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      content,
      excerpt,
      thumbnail,
      category,
      tags,
      published,
      metaTitle,
      metaDescription,
    } = req.body;

    let thumbnailUrl = thumbnail;
    if (thumbnail && thumbnail.startsWith('data:')) {
      thumbnailUrl = await uploadImage(thumbnail);
    }

    const blog = await Blog.create({
      title,
      content,
      excerpt,
      thumbnail: thumbnailUrl,
      author: req.user?._id,
      category,
      tags,
      published: published || false,
      metaTitle,
      metaDescription,
    });

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.CREATE,
      entity: 'Blog',
      entityId: blog._id,
      details: { title: blog.title },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

export const getBlogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, sort, search, category, published } = req.query;

    const query = Blog.find();

    if (search) {
      query.where('title').regex(new RegExp(search as string, 'i'));
    }

    if (category) {
      query.where('category').equals(category as string);
    }

    if (published !== undefined) {
      query.where('published').equals(published === 'true');
    }

    const result = await paginate(query, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      sort: (sort as string) || '-createdAt',
      populate: ['author'],
    });

    res.status(200).json({
      success: true,
      message: 'Blogs retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getPublishedBlogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, sort, search, category } = req.query;

    const query = Blog.find({ published: true });

    if (search) {
      query.where('title').regex(new RegExp(search as string, 'i'));
    }

    if (category) {
      query.where('category').equals(category as string);
    }

    const result = await paginate(query, {
      page: Number(page) || 1,
      limit: Number(limit) || 9,
      sort: (sort as string) || '-createdAt',
      populate: ['author'],
    });

    res.status(200).json({
      success: true,
      message: 'Blogs retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getBlogBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      published: true,
    }).populate('author', 'fullName avatar');

    if (!blog) {
      throw new AppError('Blog post not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Blog retrieved successfully',
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

export const getBlogById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'fullName avatar');

    if (!blog) {
      throw new AppError('Blog post not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Blog retrieved successfully',
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      content,
      excerpt,
      thumbnail,
      category,
      tags,
      published,
      metaTitle,
      metaDescription,
    } = req.body;

    let thumbnailUrl = thumbnail;
    if (thumbnail && thumbnail.startsWith('data:')) {
      thumbnailUrl = await uploadImage(thumbnail);
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        excerpt,
        thumbnail: thumbnailUrl,
        category,
        tags,
        published,
        metaTitle,
        metaDescription,
      },
      { new: true, runValidators: true }
    );

    if (!blog) {
      throw new AppError('Blog post not found', 404);
    }

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.UPDATE,
      entity: 'Blog',
      entityId: blog._id,
      details: { title: blog.title },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      throw new AppError('Blog post not found', 404);
    }

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.DELETE,
      entity: 'Blog',
      entityId: blog._id,
      details: { title: blog.title },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const publishBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      throw new AppError('Blog post not found', 404);
    }

    blog.published = true;
    await blog.save();

    res.status(200).json({
      success: true,
      message: 'Blog published successfully',
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

export const unpublishBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      throw new AppError('Blog post not found', 404);
    }

    blog.published = false;
    await blog.save();

    res.status(200).json({
      success: true,
      message: 'Blog unpublished successfully',
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};
