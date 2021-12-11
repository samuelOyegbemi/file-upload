import express from 'express';

import baseController from '../controllers/index';
import callRateRouter from './call_rate';

const router = express.Router();

router.get('/', baseController.home);

router.use('/call-rates', callRateRouter);

export default router;
