import express from 'express';
import { validationResult, validator } from '@wbc-nodejs/core';
import DelayedResponse from 'express-delayed-response';
import uploadAttachment from '../middlewares/uploadAttachment';
import callRateController from '../controllers/call_rate';
import setRequestTimeout from '../middlewares/setRequestTimeout';

const { delay } = DelayedResponse.init();
const callRateRouter = express.Router();

callRateRouter.get('/', callRateController.getCallRates);

callRateRouter.post(
  '/upload',
  setRequestTimeout(600000),
  uploadAttachment({ attachmentKey: 'file' }),
  validator.body.required('file'),
  validationResult('Please upload a file'),
  delay(),
  callRateController.uploadCallRateSheet,
);

callRateRouter.delete('/', callRateController.deleteAll);

export default callRateRouter;
