import { Router } from 'express';

import { controller } from '../controllers/users.controller';
import { userValidator } from '../../../../validators/user.validator';

const router = Router();

// [POST] /api/v1/user/register
router.post('/register', userValidator.register, controller.register);

// [POST] /api/v1/user/login
router.post('/login', userValidator.login, controller.login);

export default router;
