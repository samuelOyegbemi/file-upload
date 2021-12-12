import { existsSync, unlinkSync, rmdirSync, readdirSync, readFileSync } from 'fs';
import path from 'path';

/**
 * @name getFileName
 * @param {*} req
 * @param {*} file
 * @return {*} Storage
 */
export const getFileName = (req, file) => {
  let { fileName } = req.uploadConfig || {};
  const correctExtension = path.extname(file.originalname);
  if (fileName && path.extname(fileName) !== correctExtension) {
    fileName = `${fileName}${correctExtension}`;
  }
  if (!fileName) {
    fileName = `${file.fieldname}-${Date.now()}${correctExtension}`;
  }
  return fileName;
};

/**
 * @name readContent
 * @param {string} filePath
 * @return {string} Content
 */
export const readContent = filePath => {
  if (existsSync(filePath)) {
    return readFileSync(filePath, 'utf-8');
  }
  return '';
};

/**
 * @name removeLocalAttachment
 * @param {string} attPath
 * @return {Promise<boolean>} Removed
 */
export const removeLocalAttachment = async attPath => {
  const baseFolder = 'uploads/';
  return new Promise((resolve, reject) => {
    try {
      unlinkSync(attPath);
      // delete folder if empty after file has been deleted
      const [root, relativePath] = attPath.split(baseFolder);
      const uploadPath = path.join(root, baseFolder);
      let folderArr = relativePath.split('/').slice(1, -1);
      folderArr = folderArr.map((a, i) => {
        a = path.join(uploadPath, ...folderArr.slice(0, i + 1));
        return a;
      });
      folderArr = folderArr.reverse();
      folderArr.forEach(folder => {
        if (
          folder.startsWith(uploadPath) &&
          folder !== uploadPath &&
          existsSync(folder) &&
          !readdirSync(folder).length
        ) {
          rmdirSync(folder);
        }
      });
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * @name removeFile
 * @param {string} link
 * @return {Promise<void>} Removed
 */
export const removeFile = async link => {
  [, link] = link.split(`uploads/`);
  if (!link) return;
  link = path.join(path.dirname(require.main.filename), 'public/uploads', link);
  if (existsSync(link)) {
    return unlinkSync(link);
  }
};
