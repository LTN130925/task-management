import { Router } from 'express';

// controller
import { controller } from '../controllers/roles.controller';

const router = Router();

router.get('/', controller.index);

export default router;