import ExcelJS from 'exceljs';

export class Excel {
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
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ useStyles: true, useSharedStrings: true, filename: './test.xlsx' });
    const worksheet = workbook.addWorksheet(this.fileName, {
      pageSetup: { orientation: 'landscape' },
    });
    worksheet.columns = this.headers;
    for(const data of this.data) {
      worksheet.addRow(data).commit()
    }
    workbook.commit()
    return workbook;
  }
}
