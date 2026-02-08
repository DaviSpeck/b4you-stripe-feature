const ExcelJS = require('exceljs');
const ApiError = require('../../error/ApiError');

module.exports = class {
  /**
   * @typedef {object[]} Headers
   * @property {string} key
   * @property {string} width
   */

  /**
   * @param {string} fileName
   * @param {Headers} headers
   * @param {Array} data
   */
  constructor(fileName, headers, data) {
    this.fileName = fileName;
    this.headers = headers;
    this.data = data;
  }

  async execute() {
    this.data.forEach((column) => {
      if (column.length !== this.headers.length) {
        throw ApiError.badRequest(
          'The size of the data columns must be the same as the header',
        );
      }
    });
    const workbook = new ExcelJS.Workbook({ useStyles: true });
    workbook.addWorksheet(this.fileName, {
      pageSetup: { orientation: 'landscape' },
    });
    workbook.creator = 'b4you';
    workbook.created = new Date();
    const headerToFile = [];
    const headersWidth = [];

    for (const column of this.headers) {
      headerToFile.push(column.key);
      headersWidth.push({ width: column.width });
    }
    workbook.worksheets[0].addRow(headerToFile);
    workbook.worksheets[0].getRow(1).font = {
      bold: true,
    };
    workbook.worksheets[0].columns = headersWidth;

    for (const column of this.data) {
      workbook.worksheets[0].addRow(column);
    }

    workbook.worksheets[0].eachRow((Row) => {
      Row.eachCell((Cell) => {
        Cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
        };
        Cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });
    workbook.worksheets[0].columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength;
    });
    return workbook;
  }
};
