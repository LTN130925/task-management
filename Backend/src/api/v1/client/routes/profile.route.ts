import { Router } from 'express';
import multer from 'multer';

// controller
import { controller } from '../controllers/profile.controller';

// middlewares
import { Auth } from '../middlewares/auth.middleware';
import { uploadCloud } from '../middlewares/uploadCloud.middleware';

const upload = multer();

const router = Router();

// [GET] /api/v1/profile
router.get('/', Auth.requireAuth, controller.profile);

// [PATCH] /api/v1/user/profile/edit
router.patch(
  '/edit',
  Auth.requireAuth,
  upload.single('avatar'),
  uploadCloud.upload as any,
  controller.editProfile
);

export default router;
