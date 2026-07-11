import { Request, Response, NextFunction } from 'express';
import { WebsiteSettings } from '../models/WebsiteSettings.js';
import { uploadImage } from '../utils/imageUpload.js';
import { createAuditLog } from '../services/audit.service.js';
import { AuditAction } from '../types/index.js';

export const getWebsiteSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let settings = await WebsiteSettings.findOne();

    if (!settings) {
      settings = await WebsiteSettings.create({});
    }

    res.status(200).json({
      success: true,
      message: 'Website settings retrieved successfully',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateWebsiteSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      logo,
      favicon,
      contact,
      socialLinks,
      footer,
      seo,
    } = req.body;

    let settings = await WebsiteSettings.findOne();

    if (!settings) {
      settings = await WebsiteSettings.create({});
    }

    if (logo && logo.startsWith('data:')) {
      settings.logo = await uploadImage(logo);
    } else if (logo) {
      settings.logo = logo;
    }

    if (favicon && favicon.startsWith('data:')) {
      settings.favicon = await uploadImage(favicon);
    } else if (favicon) {
      settings.favicon = favicon;
    }

    if (contact) {
      settings.contact = { ...settings.contact, ...contact };
    }

    if (socialLinks) {
      settings.socialLinks = { ...settings.socialLinks, ...socialLinks };
    }

    if (footer) {
      settings.footer = { ...settings.footer, ...footer };
    }

    if (seo) {
      if (seo.openGraphImage && seo.openGraphImage.startsWith('data:')) {
        seo.openGraphImage = await uploadImage(seo.openGraphImage);
      }
      if (seo.twitterImage && seo.twitterImage.startsWith('data:')) {
        seo.twitterImage = await uploadImage(seo.twitterImage);
      }
      settings.seo = { ...settings.seo, ...seo };
    }

    await settings.save();

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.UPDATE,
      entity: 'WebsiteSettings',
      entityId: settings._id,
      details: { updatedFields: Object.keys(req.body) },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Website settings updated successfully',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};
