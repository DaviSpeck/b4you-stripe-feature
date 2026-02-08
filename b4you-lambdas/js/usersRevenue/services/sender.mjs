import MailService from "../../MailService.mjs";

const mailer = new MailService(
  process.env.MAILJET_PASSWORD,
  process.env.MAILJET_USERNAME
);

export async function sendMail({
  subject,
  to,
  variables,
  customId = "0000",
  cc = null,
}) {
  return mailer.sendMail({ subject, toAddress: to, variables, customId, cc });
}
