import { Router } from 'express';
import multer from 'multer';

// controller
import { controller } from '../controllers/users.controller';

// middlewares
import { uploadCloud } from '../../client/middlewares/uploadCloud.middleware';

// validator
import { createValidator } from '../validators/create.validator';
import { editValidator } from '../validators/edit.validator';
import { detailValidator } from '../validators/detail.validator';
import { deleteValidator } from '../validators/delete.validator';
import { changeStatusValidator } from '../validators/change-status.validator';
import { restoreValidator } from '../validators/restore.validator';

// config
import systemConfig from '../../../../config/system';

const upload = multer();

const router = Router();

// [GET] /admin/api/v1/users
router.get('/', controller.index('index'));

// [GET] /admin/api/v1/users/detail/:id
router.get('/detail/:id', detailValidator.detail, controller.detail('index'));

// [POST] /admin/api/v1/users/create
router.post(
  '/create',
  upload.single('avatar'),
  createValidator.createAccount,
  uploadCloud.upload as any,
  controller.create
);

// [PATCH] /admin/api/v1/users/edit/:id
router.patch(
  '/edit/:id',
  upload.single('avatar'),
  editValidator.editAccount,
  uploadCloud.upload as any,
  controller.edit
);

// [DELETE] /admin/api/v1/users/delete/:id
router.delete('/delete/:id', deleteValidator.delete, controller.delete);

// [PATCH] /admin/api/v1/users/change-status/:id
router.patch(
  '/change-status/:id',
  changeStatusValidator.changeStatusAccount,
  controller.changeStatus
);

// [PATCH] /admin/api/v1/users/change-multi
router.patch(
  '/change-multi',
  changeStatusValidator.changeMultiAccount('users'),
  controller.changeMulti
);

// //                    TRASH

// [GET] /admin/api/v1/users/trash
router.get(`${systemConfig.prefixTrash}`, controller.index('trash'));

// [GET] /admin/api/v1/users/trash/detail/:id
router.get(
  `${systemConfig.prefixTrash}/detail/:id`,
  detailValidator.detail,
  controller.detail('trash')
);

// [DELETE] /admin/api/v1/users/trash/delete-permanently/:id
router.delete(
  '/trash/delete-permanently/:id',
  deleteValidator.delete,
  controller.deletePermanently
);

// [PATCH] /admin/api/v1/users/trash/restore/:id
router.patch(
  '/trash/restore/:id',
  restoreValidator.restore,
  controller.restore
);

export default router;
