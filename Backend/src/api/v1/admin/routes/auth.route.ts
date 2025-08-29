import { Router } from 'express';

// controller
import { controller } from '../controllers/auth.controller';

const router = Router();

// [POST] /admin/api/v1/auth/login
router.post('/login', controller.login);

export default router;