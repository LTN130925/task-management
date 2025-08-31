import { Router } from 'express';

// controller
import { controller } from '../controllers/users.controller';

const router = Router();

// [GET] /admin/api/v1/users
router.get('/', controller.index);

export default router;
