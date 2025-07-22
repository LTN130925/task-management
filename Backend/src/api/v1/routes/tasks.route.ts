import { Router } from 'express';

import { controller } from '../controllers/tasks.controller';

// Create a new task
const router = Router();

router.get('/', controller.index);
router.get('/detail/:id', controller.detail);

export default router;
