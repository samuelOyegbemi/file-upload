import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { getEnv } from '@wbc-nodejs/core';
import { convertToBoolean } from '../helpers/utility';
import {getFileName} from "../helpers/files";

const diskUploader = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = path.join(
        path.dirname(require.main.filename),
        'public/uploads',
      );
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }
      cb(null, folder);
    },
    filename: (req, file, cb) => {
      cb(null, getFileName(req, file));
    },
  }),
});

// eslint-disable-next-line require-jsdoc
const uploadHandler = options => (req, res, next) => {
  if (!req.uploadConfig) {
    throw new Error('prepareUpload middleware must be called first!');
  }
  const { attachmentKey, type } = options;
  req.uploadConfig.isLocalDrive = true;
  return type === 'single'
    ? diskUploader.single(attachmentKey)(req, res, next)
    : diskUploader.any()(req, res, next);
};

// eslint-disable-next-line require-jsdoc
const postUploadHandler = options => (req, res, next) => {
  if (req.uploadConfig.isLocalDrive && req.file) {
    const relativePath = req.file.path.split('public/uploads/')[1];
    const httpProtocol = convertToBoolean(getEnv().ENFORCE_HTTPS) ? 'https' : req.protocol;
    req.file.path = `${httpProtocol}://${req.get('host')}/uploads/${relativePath}`;
  }
  if (req.file && req.body) {
    req.body = {
      ...req.body,
      [options.attachmentKey]: req.file.path,
    };
  }
  next();
};

/**
 * @name prepareUpload
 * @param {*} options
 * @param {function|string} options.uploadPath
 * @param {function|string} [options.fileName]
 * @return {(function(...[*]=))[]} Express middleware
 */
export const prepareUpload = ({ uploadPath, fileName = '' }) => async (req, res, next) => {
  const {
    FILE_ROOT_FOLDER,
    FILE_STORAGE_LOCATION,
    ...otherConfig
  } = getEnv();
  const baseFolder = '/';
  const folder = typeof uploadPath === 'function' ? await uploadPath(req) : uploadPath;
  fileName = typeof fileName === 'function' ? await fileName(req) : fileName;
  req.uploadConfig = {
    ...otherConfig,
    FILE_STORAGE_LOCATION,
    folder: path.join(baseFolder, folder),
    fileName,
  };
  next();
};

/**
 * @name uploadAttachment
 * @param {*} [options]
 * @param {string} [options.attachmentKey]
 * @param {string} [options.type]
 * @return {(function(...[*]=))[]} Express middleware
 */
const uploadAttachment = options => {
  options = {
    attachmentKey: 'image',
    type: 'single',
    ...(options || {}),
  };
  return [uploadHandler(options), postUploadHandler(options)];
};

export default uploadAttachment;
