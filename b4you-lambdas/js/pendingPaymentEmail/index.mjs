import { date } from './date.mjs';
import mailjet from 'node-mailjet';
import { generatePix, generatedBillet } from './emails/billet.mjs';
const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const FRONTEND_DATE_WITHOUT_TIME = 'DD/MM/YYYY';

/**
 * @param {string} value Ex: (100.53)
 */
const formatBRL = (value) => formatter.format(value).replace(/^(\D+)/, '$1');

/**
 * @param {string} value Ex: (danilo de maria)
 * @return {string} value Danilo de Maria
 */
const capitalizeName = (name) => {
  if (!name) return '';
  name = name.toLowerCase().replace(/(?:^|\s)\S/g, (capitalize) => capitalize.toUpperCase());

  const PreposM = ['Da', 'De', 'Do', 'Das', 'Dos', 'A', 'E'];
  const prepos = ['da', 'de', 'do', 'das', 'dos', 'a', 'e'];

  for (let i = PreposM.length - 1; i >= 0; i -= 1) {
    name = name.replace(
      RegExp(`\\b${PreposM[i].replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'g'),
      prepos[i]
    );
  }

  return name;
};

export const handler = async (event) => {
  console.log(event);

  const { MAILJET_PASSWORD, MAILJET_USERNAME, MAILJET_TEMPLATE_ID, MAILJET_EMAIL_SENDER } =
    process.env;

  const maijJetInstance = mailjet.apiConnect(MAILJET_PASSWORD, MAILJET_USERNAME);

  try {
    const { Records } = event;
    const [message] = Records;
    const {
      email,
      amount,
      bar_code,
      due_date,
      student_name,
      producer_name,
      product_name,
      support_email,
      url,
      qrcode,
      pix_code,
      payment_method,
    } = JSON.parse(message.body);
    let subject;
    let variables;
    const toAddress = [
      {
        Email: email,
        Name: student_name,
      },
    ];
    if (payment_method === 'billet') {
      subject = `Seu boleto chegou: ${product_name}`;
      variables = generatedBillet({
        amount: formatBRL(amount),
        bar_code,
        due_date: date(due_date).format(FRONTEND_DATE_WITHOUT_TIME),
        student_name: capitalizeName(student_name),
        producer_name: capitalizeName(producer_name),
        product_name: capitalizeName(product_name),
        support_email,
        url,
      });
    }

    if (payment_method === 'pix') {
      subject = `Pague seu pix: ${product_name}`;
      variables = generatePix({
        amount: formatBRL(amount),
        qrcode,
        pix_code,
        student_name: capitalizeName(student_name),
        support_email,
        producer_name: capitalizeName(producer_name),
        product_name,
        url,
      });
    }

    try {
      const response = await maijJetInstance.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: MAILJET_EMAIL_SENDER,
              Name: 'B4you',
            },
            To: toAddress,
            TemplateID: +MAILJET_TEMPLATE_ID,
            TemplateLanguage: true,
            Subject: subject,
            Variables: variables,
            CustomID: '0000',
          },
        ],
      });

      console.log(response);
    } catch (error) {
      console.log('erro ao enviar email -> ', error);
    }
  } catch (error) {
    console.log(error);
    throw error;
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};
