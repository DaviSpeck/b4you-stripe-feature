import {
  approvedPaymentTemplate,
  approvedPaymentAstronTemplate,
  approvedPaymentEcommerceTemplate,
  approvedPaymentProductExternalTemplate,
  approvedPaymentPhysicalTemplate,
  customApprovedPaymentProductExternalTemplate,
  customApprovedPaymentTemplate,
} from "./messages.mjs";
import { capitalizeName, formatBRL } from "../utils/formatters.mjs";

export class ApprovedPayment {
  constructor(data, MailService) {
    this.data = data;
    this.MailService = MailService;
  }

  async send() {
    const {
      email,
      full_name,
      product_name,
      amount,
      producer_name,
      support_email,
      token,
      sale_uuid,
      type,
      email_subject = null,
      email_template = null,
    } = this.data;
    const toAddress = [
      {
        Email: email,
        Name: capitalizeName(full_name),
      },
    ];
    let subject = email_subject || "";
    let variables = null;
    if (type === "external") {
      subject = email_subject || `Compra realizada com sucesso!`;
      if (email_template) {
        variables = customApprovedPaymentProductExternalTemplate(
          capitalizeName(full_name),
          capitalizeName(product_name),
          formatBRL(amount),
          capitalizeName(producer_name),
          support_email,
          sale_uuid,
          email_template
        );
      } else {
        variables = approvedPaymentProductExternalTemplate(
          capitalizeName(full_name),
          capitalizeName(product_name),
          formatBRL(amount),
          capitalizeName(producer_name),
          support_email,
          sale_uuid
        );
      }
    } else if (type === "physical") {
      subject = email_subject || `Compra realizada com sucesso!`;
      if (email_template) {
        variables = customApprovedPaymentProductExternalTemplate(
          capitalizeName(full_name),
          capitalizeName(product_name),
          formatBRL(amount),
          capitalizeName(producer_name),
          support_email,
          sale_uuid,
          email_template
        );
      } else {
        variables = approvedPaymentPhysicalTemplate(
          capitalizeName(full_name),
          capitalizeName(product_name),
          formatBRL(amount),
          capitalizeName(producer_name),
          support_email,
          token,
          sale_uuid
        );
      }
    } else if (type === "astron") {
      subject = email_subject || `Compra realizada com sucesso!`;
      if (email_template) {
        variables = customApprovedPaymentProductExternalTemplate(
          capitalizeName(full_name),
          capitalizeName(product_name),
          formatBRL(amount),
          capitalizeName(producer_name),
          support_email,
          sale_uuid,
          email_template
        );
      } else {
        variables = approvedPaymentAstronTemplate(
          capitalizeName(full_name),
          capitalizeName(product_name),
          formatBRL(amount),
          capitalizeName(producer_name),
          support_email,
          token,
          sale_uuid
        );
      }
    } else if (type === "ecommerce") {
      subject = email_subject || `Compra realizada com sucesso!`;
      if (email_template) {
        variables = customApprovedPaymentProductExternalTemplate(
          capitalizeName(full_name),
          capitalizeName(product_name),
          formatBRL(amount),
          capitalizeName(producer_name),
          support_email,
          sale_uuid,
          email_template
        );
      } else {
        variables = approvedPaymentEcommerceTemplate(
          capitalizeName(full_name),
          capitalizeName(product_name),
          formatBRL(amount),
          capitalizeName(producer_name),
          support_email,
          token,
          sale_uuid
        );
      }
    } else {
      subject =
        email_subject ||
        `Compra realizada com sucesso! Seu acesso a ${capitalizeName(
          product_name
        )} chegou!`;
      if (email_template) {
        variables = customApprovedPaymentTemplate(
          capitalizeName(full_name),
          capitalizeName(product_name),
          formatBRL(amount),
          capitalizeName(producer_name),
          support_email,
          token,
          sale_uuid,
          email_template
        );
      } else {
        variables = approvedPaymentTemplate(
          capitalizeName(full_name),
          capitalizeName(product_name),
          formatBRL(amount),
          capitalizeName(producer_name),
          support_email,
          token,
          sale_uuid
        );
      }
    }

    const response = await this.MailService.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}
