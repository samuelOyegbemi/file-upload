import express from 'express';
import { validationResult, validator } from '@wbc-nodejs/core';
import uploadAttachment from '../middlewares/uploadAttachment';
import callRateController from '../controllers/call_rate';
import setRequestTimeout from '../middlewares/setRequestTimeout';

const callRateRouter = express.Router();

callRateRouter.get('/', callRateController.getCallRates);

callRateRouter.post(
  '/upload',
  setRequestTimeout(600000),
  uploadAttachment({ attachmentKey: 'file' }),
  validator.body.required('file'),
  validationResult('Please upload a file'),
  callRateController.uploadCallRateSheet,
);

callRateRouter.delete('/', callRateController.deleteAll);

export default callRateRouter;
