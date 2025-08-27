import { Router } from 'express';

const router = Router();

// controller
import { controller } from '../../admin/controllers/tasks.controller';

router.get('/dropdowns/users', controller.dropdowns);

router.get('/', controller.index);

export default router;