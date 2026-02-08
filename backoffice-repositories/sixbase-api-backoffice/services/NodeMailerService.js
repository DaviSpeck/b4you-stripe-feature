const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'davispeck86@gmail.com',
    pass: 'zzcq pyzx wpzx lfny'
  }
});

/**
 * Envia e-mail com anexos.
 * @param {{to: string|string[], subject: string, text?: string, html?: string, attachments?: object[]}} options
 */
async function sendMail(options) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    attachments: options.attachments
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendMail };