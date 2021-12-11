import { response } from '@wbc-nodejs/core';
import CallRate from '../models/callrate';
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
 * @return {Object} User object
 */
const uploadCallRateSheet = async (req, res) => {
  const { file } = req.body;
  return response.ok(res, { file });
};

export default {
  getCallRates,
  uploadCallRateSheet,
};
