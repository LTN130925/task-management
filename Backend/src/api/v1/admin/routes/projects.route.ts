import { Router } from 'express';

// controller
import { controller } from '../../admin/controllers/projects.controller';

// validator
import { changeStatusValidator } from '../../admin/validators/change-status.validator';
import { createValidator } from '../../admin/validators/create.validator';
import { deleteValidator } from '../validators/delete.validator';
import { detailValidator } from '../validators/detail.validator';
import { restoreValidator } from '../validators/restore.validator';

// config
import systemConfig from '../../../../config/system';
import { editValidator } from '../validators/edit.validator';

const router = Router();

// [GET] /admin/api/v1/dropdowns/users
router.get('/dropdowns/admins', controller.dropdowns);

// [GET] /admin/api/v1/projects
router.get('/', controller.index('index'));

// [GET] /admin/api/v1/projects/detail/:id
router.get('/detail/:id', detailValidator.detail, controller.detail('index'));

// [PATCH] /admin/api/v1/projects/create
router.post('/create', createValidator.createdProject, controller.create);

// [PATCH] /admin/api/v1/projects/edit/:id
router.patch('/edit/:id', editValidator.editProject, controller.edit);

// // [DELETE] /admin/api/v1/projects/delete/:id
router.delete('/delete/:id', deleteValidator.delete, controller.delete);

// [PATCH] /admin/api/v1/projects/change-status/:id
router.patch(
  '/change-status/:id',
  changeStatusValidator.changeStatusProject,
  controller.changeStatus
);

// [PATCH] /admin/api/v1/projects/change-multi
router.patch(
  '/change-multi',
  changeStatusValidator.changeMultiProject,
  controller.changeMulti
);

//                    TRASH
// // [GET] /admin/api/v1/projects/trash
// router.get(`${systemConfig.prefixTrash}`, controller.index('trash'));

// // [GET] /admin/api/v1/projects/trash/detail/:id
// router.get(
//   `${systemConfig.prefixTrash}/detail/:id`,
//   detailValidator.detail,
//   controller.detail('trash')
// );

// // [DELETE] /admin/api/v1/projects/trash/delete-permanently/:id
// router.delete(
//   `${systemConfig.prefixTrash}/delete-permanently/:id`,
//   deleteValidator.delete,
//   controller.deletePermanently
// );

// // [PATCH] /admin/api/v1/projects/trash/restore/:id
// router.patch(
//   `${systemConfig.prefixTrash}/restore/:id`,
//   restoreValidator.restore,
//   controller.restore
// );

// // [PATCH] /admin/api/v1/projects/trash/change-multi
// router.patch(
//   `${systemConfig.prefixTrash}/change-multi`,
//   changeStatusValidator.changeMulti,
//   controller.changeMulti
// );

export default router;
