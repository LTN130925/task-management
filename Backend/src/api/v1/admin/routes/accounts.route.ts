import { Router } from 'express';

// controller
import { controller } from '../controllers/accounts.controller';

const router = Router();

router.get('/', controller.index);

export default router;