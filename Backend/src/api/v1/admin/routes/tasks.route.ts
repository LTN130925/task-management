import { Router } from 'express';

const router = Router();

// controller
import { controller } from '../../admin/controllers/tasks.controller';

router.get('/dropdowns/users', controller.dropdowns);

router.get('/', controller.index);

router.get('/detail/:id', controller.detail);

router.get('/detail/:id/subtasks', controller.subtasks);

export default router;