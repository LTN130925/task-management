import { Router } from 'express';

import { controller } from '../controllers/tasks.controller';
import { changeStatusValidator } from '../validators/change-status.validator';
import { createValidator } from '../validators/create.validator';

const router = Router();

// [GET] /api/v1/tasks
router.get('/', controller.index);

// [GET] /api/v1/tasks/detail/:id
router.get('/detail/:id', controller.detail);

// [GET] /api/v1/tasks/detail/:id/subtasks
router.get('/detail/:id/subtasks', controller.subtasks);

// [PATCH] /api/v1/tasks/change-status/:id
router.patch(
  '/change-status/:id',
  changeStatusValidator.changeStatus,
  controller.changeStatus
);

// [PATCH] /api/v1/tasks/change-multi
router.patch(
  '/change-multi',
  changeStatusValidator.changeMulti,
  controller.changeMultiStatus
);

// [POST] /api/v1/tasks/create
router.post('/create', createValidator.create, controller.create);

// => validation edit and create is same
// [PATCH] /api/v1/tasks/edit/:id
router.patch('/edit/:id', createValidator.create, controller.edit);

// [DELETE] /api/v1/tasks/delete/:id
router.delete('/delete/:id', controller.delete);

export default router;
