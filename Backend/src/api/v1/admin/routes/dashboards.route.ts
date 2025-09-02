import { Router } from 'express';

// controller
import { controller } from '../controllers/dashboards.controller';

const router = Router();

// [GET] /admin/api/v1/dashboard/dropdowns/users
router.get('/', controller.dropdownUsers);

// [GET] /admin/api/v1/dashboard/dropdowns/accounts
router.get('/', controller.dropdownAccounts);

// [GET] /admin/api/v1/dashboard/progress
router.get('/progress', controller.progress);

// [GET] /admin/api/v1/dashboard/system
router.get('/system', controller.system);

export default router;
