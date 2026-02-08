const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const pth = require('path');

class DataToPDF {
  constructor(data) {
    this.data = data;
  }

  async pdf() {
    const {
      client_name,
      client_cpf,
      client_email,
      producer_name,
      producer_cpf,
      producer_email,
      date,
      amount,
      description,
    } = this.data;
    const pdfDoc = await PDFDocument.create();
    const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page = pdfDoc.addPage([1080, 826]);
    const { height, width } = page.getSize();

    const image = fs.readFileSync(
      pth.join(__dirname, './images/logo.png'),
      (err, data) => data,
    );
    const pngImage = await pdfDoc.embedPng(image);

    page.drawImage(pngImage, {
      x: 71,
      y: height - 4 * 30,
    });
    page.drawText('Recibo de pagamento autônomo', {
      x: 238,
      y: height - 4 * 18,
      size: 36,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(`Data: ${date}`, {
      x: 240,
      y: height - 4 * 18 - 35,
      size: 22,
      font: normalFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText('Contratante', {
      x: 238,
      y: height - 230,
      size: 27.23,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(client_name, {
      x: 240,
      y: height - 270,
      size: 18.15,
      font: normalFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(client_cpf, {
      x: 240,
      y: height - 295,
      size: 18.15,
      font: normalFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText(client_email, {
      x: 240,
      y: height - 320,
      size: 18.15,
      font: normalFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText('Prestador de Serviço', {
      x: 562,
      y: height - 230,
      size: 27.23,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(producer_name, {
      x: 564,
      y: height - 270,
      size: 18.15,
      font: normalFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(producer_cpf, {
      x: 564,
      y: height - 295,
      size: 18.15,
      font: normalFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText(producer_email, {
      x: 564,
      y: height - 320,
      size: 18.15,
      font: normalFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText('DESCRIÇÃO DO SERVIÇO PRESTADO', {
      x: 240,
      y: height - 445,
      size: 21.78,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(description, {
      x: 240,
      y: height - 520,
      size: 18,
      font: normalFont,
      color: rgb(0, 0, 0),
    });

    const rectangle = fs.readFileSync(
      pth.join(__dirname, './images/Rectangle.png'),
      (err, data) => data,
    );
    const rectangleImg = await pdfDoc.embedPng(rectangle);
    page.drawImage(rectangleImg, {
      x: 210,
      y: height - 720,
    });
    const rectangle2 = fs.readFileSync(
      pth.join(__dirname, './images/Rectangle_2.png'),
      (err, data) => data,
    );
    const rectangle2Img = await pdfDoc.embedPng(rectangle2);
    page.drawImage(rectangle2Img, {
      x: 210,
      y: height - 560,
    });
    page.drawText('VALOR TOTAL', {
      x: width - 570,
      y: height - 665,
      size: 21.78,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    let svgWidth = 50;
    let svgX = 300;
    let textX = 305;
    if (amount.length <= 8) {
      svgWidth += 10;
      svgX += 10;
      textX += 20;
    } else if (amount.length <= 9) {
      svgWidth += 20;
      svgX += 20;
      textX += 30;
    } else if (amount.length <= 11) {
      svgWidth += 40;
      svgX += 40;
      textX += 50;
    } else if (amount.length <= 12) {
      svgWidth += 50;
      svgX += 50;
      textX += 60;
    }
    const svgPath = `M 0 0 H ${svgWidth} A 1 1 0 0 1 ${svgWidth} 50 H 0 A 1 1 0 0 1 0 0`;
    page.drawSvgPath(svgPath, {
      x: width - svgX, // default 360
      y: height - 632,
      color: rgb(0.101961, 0.45098, 0.909804),
    });
    page.drawText(amount, {
      x: width - textX, // default 380
      y: height - 665,
      size: 21.78,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes.buffer, 'binary');
  }
}

module.exports = DataToPDF;
