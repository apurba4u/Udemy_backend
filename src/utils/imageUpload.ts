import axios from 'axios';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';

const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

export const uploadImage = async (imageBase64: string): Promise<string> => {
  if (!env.IMGBB_API_KEY) {
    throw new AppError('ImgBB API key is not configured', 500);
  }

  try {
    const formData = new URLSearchParams();
    formData.append('key', env.IMGBB_API_KEY);
    formData.append('image', imageBase64);

    const response = await axios.post(IMGBB_API_URL, formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.data.success) {
      return response.data.data.url;
    }

    throw new AppError('Failed to upload image', 500);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Image upload failed', 500);
  }
};

export const deleteImage = async (_imageUrl: string): Promise<void> => {
  // ImgBB doesn't support deletion via API in free tier
  // Images will be automatically deleted after some time
};
