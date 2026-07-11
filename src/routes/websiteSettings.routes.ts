import { Router } from 'express';
import {
  getWebsiteSettings,
  updateWebsiteSettings,
} from '../controllers/websiteSettings.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.get('/', getWebsiteSettings);
router.put('/', authenticate, authorize(UserRole.ADMIN), updateWebsiteSettings);

export default router;
