import { Router } from 'express';

// controller
import { controller } from '../controllers/auth.controller';

// validators
import { loginValidator } from '../validators/login.validator';

const router = Router();

// [POST] /admin/api/v1/auth/login
router.post('/login', loginValidator.login, controller.login);

export default router;
