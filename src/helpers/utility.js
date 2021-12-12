import { getEnv, pickFromObject } from '@wbc-nodejs/core';

/**
 * @name bulkUpdateMapper
 * @param {string[]} filterKeys
 * @param {*} data
 * @return {*[]} bulkOption
 */
export const bulkUpdateMapper = (filterKeys, data = []) => {
  return data.map(d => {
    return {
      updateOne: {
        filter: pickFromObject(d, filterKeys),
        update: d,
        upsert: true,
      },
    };
  });
};

/**
 * @name convertToBoolean
 * @param {string|boolean} value
 * @return {boolean} Boolean value
 */
export const convertToBoolean = value => {
  if (!value) {
    return false;
  }
  value = String(value).toLowerCase();
  return !['false', '0', 'no'].includes(value);
};

/**
 * @name getValueFromReq
 * @param {*} req
 * @param {string} key
 * @param {string} [defaultVal]
 * @return {*} Where condition
 */
export const getValueFromReq = (req, key, defaultVal) => {
  if (!req || !key) return null;
  return req.params[key] || req.query[key] || defaultVal;
};

/**
 * @name getMaxParallelAsync
 * @param {*} req
 * @return {*} Where condition
 */
export const getMaxParallelAsync = req => {
  const defaultMaxParallel = 50;
  let { maxParallel } = req.query;
  maxParallel = maxParallel || getEnv().MAX_PARALLEL_ASYNC;
  maxParallel = maxParallel ? parseInt(maxParallel, 10) : defaultMaxParallel;
  return Number.isNaN(maxParallel) ? defaultMaxParallel : Math.min(maxParallel, defaultMaxParallel);
};
