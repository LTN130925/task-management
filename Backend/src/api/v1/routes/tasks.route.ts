import { Router } from 'express';

import { controller } from '../controllers/tasks.controller';
import { changeStatusValidator } from '../../../../validators/change-status.validator';
import { createValidator } from '../../../../validators/create.validator';

const router = Router();

router.get('/', controller.index);

router.get('/detail/:id', controller.detail);

router.patch(
  '/change-status/:id',
  changeStatusValidator.changeStatus,
  controller.changeStatus
);

router.patch(
  '/change-multi',
  changeStatusValidator.changeMulti,
  controller.changeMultiStatus
);

router.post('/create', createValidator.create, controller.create);
// => validation edit and create is same
router.patch('/edit/:id', createValidator.create, controller.edit);

router.delete('/delete/:id', controller.delete);

export default router;
