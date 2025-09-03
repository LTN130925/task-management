import { Router } from 'express';
import multer from 'multer';

// controller
import { controller } from '../controllers/profile.controller';

// middlewares
import { uploadCloud } from '../../client/middlewares/uploadCloud.middleware';

// validator
import { editValidator } from '../validators/edit.validator';

const upload = multer();

const router = Router();

// [GET] /admin/api/v1/profile
router.get('/', controller.index);

// [PATCH] /admin/api/v1/profile/edit
router.patch(
  '/edit',
  upload.single('avatar'),
  editValidator.editProfile,
  uploadCloud.upload as any,
  controller.edit
);

export default router;
