import { Router } from 'express';

// controller
import { controller } from '../controllers/dashboards.controller';

const router = Router();

// [GET] /admin/api/v1/dashboard/progress
router.get('/', controller.progress);

// [GET] /admin/api/v1/dashboard/system
router.get('/progress', controller.system);

export default router;
