import { Router } from 'express';

import { controller } from '../controllers/users.controller';
import { userValidator } from '../validators/user.validator';
import { Auth } from '../middlewares/auth.middleware';

const router = Router();

// [POST] /api/v1/user/register
router.post('/register', userValidator.register, controller.register);

// [POST] /api/v1/user/login
router.post('/login', userValidator.login, controller.login);

// [POST] /api/v1/user/refresh-token
router.post('/refresh-token', controller.refreshToken);

// [POST] /api/v1/user/logout
router.post('/logout', controller.logout);

// [POST] /api/v1/user/password/forgot
router.post(
  '/password/forgot',
  userValidator.forgotPassword,
  controller.forgotPassword
);

// [POST] /api/v1/user/password/otp
router.post('/password/otp', userValidator.otpPassword, controller.otpPassword);

// [POST] /api/v1/user/password/reset
router.post(
  '/password/reset',
  Auth.requireAuth,
  userValidator.resetPassword,
  controller.resetPassword
);

// [GET] /api/v1/user/profile
router.get('/profile', Auth.requireAuth, controller.profile);

// [PATCH] /api/v1/user/profile/edit
router.patch('/profile/edit', Auth.requireAuth, controller.editProfile);

// [GET] /api/v1/user/list
router.get('/list', Auth.requireAuth, controller.list);

export default router;
