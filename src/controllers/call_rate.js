import { BadRequestError, response } from '@wbc-nodejs/core';
import runAsync from 'async';
import CallRate from '../models/callrate';
import spreadsheet from '../helpers/spreadsheet';
import { removeFile } from '../helpers/files';
import { getMaxParallelAsync } from '../helpers/utility';

/**
 * @name getCallRates
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @return {Object} Paginated User
 */
const getCallRates = async (req, res) => {
  const callRates = await CallRate.find().paginate(req.query);
  return response.ok(res, callRates);
};

/**
 * @name uploadCallRateSheet
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next function
 * @return {Response} Express response
 */
const uploadCallRateSheet = async (req, res) => {
  if (!req.file || !req.file.path) {
    throw new BadRequestError('No file found');
  }
  const data = spreadsheet.loadData(req.file.path);
  await runAsync
    .mapLimit(data, getMaxParallelAsync(req), async rate =>
      CallRate.updateOne({ id: rate.id }, rate, { upsert: true }),
    )
    .catch();
  removeFile(req.file.path).catch();
  if (!req.timedout) {
    return response.ok(res, { message: 'Data uploaded successfully!' });
  }
};

/**
 * @name deleteAll
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @return {Response} Express response
 */
const deleteAll = async (req, res) => {
  await CallRate.deleteMany();
  return response.ok(res, { message: 'All call rates deleted successfully!' });
};

export default {
  getCallRates,
  uploadCallRateSheet,
  deleteAll,
};
