import express from 'express';

import baseController from '../controllers/index';

const router = express.Router();

router.get('/', baseController.home);

export default router;
