const { PDFDocument, StandardFonts } = require('pdf-lib');
/**
 *
 * @typedef {Object} Params
 * @property {string} watermark
 * @property {string} title
 */

const PdfHelper = (pdfHelper, fonts) => ({
  /**
   *
   * @param {byte[]} pdfBytes
   * @param {Params} params
   * @returns
   */

  waterMark: async (pdfBytes, { watermark }) => {
    const pdfDoc = await pdfHelper.load(pdfBytes, { ignoreEncryption: true });
    const helveticaFont = await pdfDoc.embedFont(fonts.Helvetica);
    const textSize = 12;
    const textWidth = helveticaFont.widthOfTextAtSize(watermark, textSize);
    const pages = pdfDoc.getPages();
    pages.forEach((page) => {
      const { width } = page.getSize();
      const marginTotal = width - textWidth;
      page.drawText(watermark, {
        x: marginTotal / 2,
        y: 10,
        size: textSize,
        font: helveticaFont,
        opacity: 0.5,
      });
    });

    const pdf = await pdfDoc.save();
    return pdf;
  },

  certificatePDF: async (image) => {
    const pdfDoc = await PDFDocument.create();
    const pngImage = await pdfDoc.embedPng(image);
    const pngDims = pngImage.scale(1);
    const page = pdfDoc.addPage([pngDims.width, pngDims.height]);
    const { width, height } = page.getSize();
    page.drawImage(pngImage, {
      x: (width - pngDims.width) / 2,
      y: (height - pngDims.height) / 2,
      width: pngDims.width,
      height: pngDims.height,
    });
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  },
});

module.exports = PdfHelper(PDFDocument, StandardFonts);
