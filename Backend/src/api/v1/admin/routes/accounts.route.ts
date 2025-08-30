import { Router } from 'express';
import multer from 'multer';

// validators
import { createValidator } from '../validators/create.validator';
import { editValidator } from '../validators/edit.validator';
import { changeStatusValidator } from '../validators/change-status.validator';
import { deleteValidator } from '../validators/delete.validator';
import { detailValidator } from '../validators/detail.validator';

// controller
import { controller } from '../controllers/accounts.controller';

// middlewares
import { uploadCloud } from '../../client/middlewares/uploadCloud.middleware';

const upload = multer();

const router = Router();

// [GET] /admin/api/v1/accounts
router.get('/', controller.index);

// [POST] /admin/api/v1/accounts/create
router.post(
  '/create',
  upload.single('avatar'),
  createValidator.createAccount,
  uploadCloud.upload as any,
  controller.create
);

// [PATCH] /admin/api/v1/accounts/edit/:id
router.patch(
  '/edit/:id',
  upload.single('avatar'),
  editValidator.editAccount,
  uploadCloud.upload as any,
  controller.edit
);

// [GET] /admin/api/v1/accounts/detail/:id
router.get('/detail/:id', detailValidator.detail, controller.detail);

// // [PATCH] /admin/api/v1/accounts/change-status/:id
router.patch(
  '/change-status/:id/',
  changeStatusValidator.changeStatusAccount,
  controller.changeStatus
);

// [DELETE] /admin/api/v1/accounts/delete/:id
router.delete('/delete/:id', deleteValidator.delete, controller.delete);

// [PATCH] /admin/api/v1/accounts/change-multi
router.patch(
  '/change-multi',
  changeStatusValidator.changeMultiAccount,
  controller.changeMulti
);

export default router;
