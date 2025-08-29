import { Router } from 'express';

// controller
import { controller } from '../controllers/auth.controller';

// validators
import { loginValidator } from '../validators/login.validator';

const router = Router();

// [POST] /admin/api/v1/auth/login
router.post('/login', loginValidator.login, controller.login);

// [POST] /admin/api/v1/auth/refresh-token
router.post('/refresh-token', controller.refreshToken);

// [POST] /admin/api/v1/auth/logout
router.post('/logout', controller.logout);

export default router;
