import { Router } from 'express';

// controller
import { controller } from '../controllers/projects.controller';

// validator
import { detailValidator } from '../validators/detail.validator';

const router = Router();

// [GET] /api/v1/projects
router.get('/', controller.index);

// [GET] /api/v1/projects/detail/:id
router.get('/detail/:id', detailValidator.detail, controller.detail);

export default router;
