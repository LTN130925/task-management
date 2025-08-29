import { Router } from 'express';

// controller
import { controller } from '../controllers/dashboards.controller';

const router = Router();

// [GET] /admin/api/v1/dashboard
router.get('/', controller.index);

export default router;
