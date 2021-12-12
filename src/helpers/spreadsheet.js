import xlsx from 'xlsx';

/**
 * @name loadData
 * @param {string} filePath
 * @param {number} [sheetIndex = 0]
 * @return {*[]} array of data
 */
const loadData = (filePath, sheetIndex = 0) => {
  const workbook = xlsx.readFile(filePath);
  return xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[sheetIndex]]);
};

export default {
  loadData,
};
