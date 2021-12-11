import express from 'express';
import uploadAttachment, { prepareUpload } from '../middlewares/uploadAttachment';
import callRateController from '../controllers/call_rate';

const callRateRouter = express.Router();

callRateRouter.get('/', callRateController.getCallRates);

callRateRouter.post(
  '/upload',
  prepareUpload({ uploadPath: 'rates' }),
  uploadAttachment({ attachmentKey: 'file' }),
  callRateController.uploadCallRateSheet,
);

export default callRateRouter;
