import { Router } from 'express';

// controller
import { controller } from '../../admin/controllers/tasks.controller';

// validator
import { changeStatusValidator } from '../../admin/validators/change-status.validator';
import { createValidator } from '../../admin/validators/create.validator';

// config
import systemConfig from '../../../../config/system';

const router = Router();

// [GET] /admin/api/v1/dropdowns/users
router.get('/dropdowns/users', controller.dropdowns);

// [GET] /admin/api/v1/tasks
router.get('/', controller.index);

// [GET] /admin/api/v1/tasks/detail/:id
router.get('/detail/:id', controller.detail);

// [GET] /admin/api/v1/tasks/detail/:id/subtasks
router.get('/detail/:id/subtasks', controller.subtasks);

// [PATCH] /admin/api/v1/tasks/create
router.post('/create', createValidator.create, controller.create);

// [PATCH] /admin/api/v1/tasks/edit/:id
router.patch('/edit/:id', createValidator.create, controller.edit);

// [DELETE] /admin/api/v1/tasks/delete/:id
router.delete('/delete/:id', controller.delete);

// [PATCH] /admin/api/v1/tasks/change-status/:id
router.patch(
  '/change-status/:id',
  changeStatusValidator.changeStatus,
  controller.changeStatus
);

// [PATCH] /admin/api/v1/tasks/change-multi
router.patch(
  '/change-multi',
  changeStatusValidator.changeMulti,
  controller.changeMulti
);

//                    TRASH
// [GET] /admin/api/v1/tasks/trash/index
router.get(`${systemConfig.prefixTrash}/index`, controller.trash);

export default router;
