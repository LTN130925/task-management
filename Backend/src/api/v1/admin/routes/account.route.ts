import { Router } from 'express';

// controller
import { controller } from '../controllers/account.controller';

const router = Router();

router.get('/', controller.index);

export default router;