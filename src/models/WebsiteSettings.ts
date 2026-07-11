import mongoose, { Schema, Model } from 'mongoose';
import { IWebsiteSettings } from '../types/index.js';

const websiteSettingsSchema = new Schema<IWebsiteSettings>(
  {
    logo: {
      type: String,
      default: null,
    },
    favicon: {
      type: String,
      default: null,
    },
    contact: {
      email: { type: String, trim: true },
      phone: { type: String, trim: true },
      address: { type: String, trim: true },
    },
    socialLinks: {
      facebook: { type: String, trim: true },
      twitter: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      youtube: { type: String, trim: true },
      instagram: { type: String, trim: true },
    },
    footer: {
      copyright: { type: String, trim: true },
      description: { type: String, trim: true },
    },
    seo: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      keywords: { type: [String], default: [] },
    },
  },
  {
    timestamps: true,
  }
);

export const WebsiteSettings: Model<IWebsiteSettings> =
  mongoose.model<IWebsiteSettings>('WebsiteSettings', websiteSettingsSchema);
