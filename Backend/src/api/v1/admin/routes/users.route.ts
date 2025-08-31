import { Router } from 'express';

// controller
import { controller } from '../controllers/users.controller';

const router = Router();

// [GET] /admin/api/v1/users
router.get('/', controller.index);

// [GET] /admin/api/v1/users/detail/:id
router.get('/detail/:id', controller.detail);

export default router;
