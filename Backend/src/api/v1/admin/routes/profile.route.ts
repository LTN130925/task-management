import { Router } from 'express';

// controller
import { controller } from '../controllers/profile.controller';

const router = Router();

// [GET] /admin/api/v1/profile
router.get('/', controller.index);

export default router;
