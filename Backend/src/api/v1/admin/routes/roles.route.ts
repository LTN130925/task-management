import { Router } from 'express';

// validators
import { createValidator } from '../validators/create.validator';
import { editValidator } from '../validators/edit.validator';

// controller
import { controller } from '../controllers/roles.controller';

const router = Router();

// [GET] /admin/api/v1/roles
router.get('/', controller.index);

// [POST] /admin/api/v1/roles/create
router.post('/create', createValidator.create, controller.create);

// [PATCH] /admin/api/v1/roles/edit/:id
router.patch('/edit/:id', editValidator.edit, controller.edit);

// [DELETE] /admin/api/v1/roles/delete/:id
router.delete('/delete/:id', controller.delete);

export default router;
