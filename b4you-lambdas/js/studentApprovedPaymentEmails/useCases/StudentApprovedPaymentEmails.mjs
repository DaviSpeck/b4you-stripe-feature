import { ApprovedPayment } from '../emails/ApprovedPayment.mjs';
import { FirstAccess } from '../emails/FirstAccess.mjs';
import { StudentSubscriptionRenewed } from '../emails/SubscriptionRenewed.mjs';
import {
  EBOOK,
  ECOMMERCE,
  PAYMENT_ONLY_TYPE,
  PHYSICAL_TYPE,
  VIDEO_TYPE,
} from '../utils/productTypes.mjs';

export class StudentEmailApprovedPayment {
  constructor(
    { product, currentStudent, saleItem, charge, renew = false },
    database,
    mailInstance
  ) {
    this.product = product;
    this.currentStudent = currentStudent;
    this.saleItem = saleItem;
    this.renew = renew;
    this.database = database;
    this.mailInstance = mailInstance;
    this.charge = charge;
  }

  async execute() {
    const product = await this.database.findIdUser(this.saleItem.id_product);
    const producer = await this.database.findUser(product.id_user);
    const notificationsSettings = await this.database.findUserNotificationsSettings(product.id_user);
    if (notificationsSettings.mail_approved_payment) {
      console.log('DISPARANDO email -> email ativado para usuário', product.id_user)
      if (this.renew) {
        await new StudentSubscriptionRenewed(
          {
            email: this.currentStudent.email,
            student_name: this.currentStudent.full_name,
            product_name: this.product.name,
            amount: this.charge.price,
          },
          this.mailInstance
        ).send();
        return '';
      }

      if (this.product.id_type === PAYMENT_ONLY_TYPE) {
        await new ApprovedPayment(
          {
            email: this.currentStudent.email,
            full_name: this.currentStudent.full_name,
            product_name: this.product.name,
            amount: this.charge.price,
            producer_name: product.nickname ? product.nickname : producer.full_name,
            support_email: product.support_email ? product.support_email : producer.email,
            sale_uuid: this.saleItem.uuid,
            type: 'external',
            email_subject: product.email_subject,
            email_template: product.email_template,
          },
          this.mailInstance
        ).send();
        return '';
      }
      if (this.product.id_type === PHYSICAL_TYPE) {
        const session = await this.database.createStudentSession(this.currentStudent.id);
        await new ApprovedPayment(
          {
            email: this.currentStudent.email,
            full_name: this.currentStudent.full_name,
            product_name: this.product.name,
            amount: this.charge.price,
            producer_name: product.nickname ? product.nickname : producer.full_name,
            support_email: product.support_email ? product.support_email : producer.email,
            sale_uuid: this.saleItem.uuid,
            token: session.uuid,
            type: 'physical',
            email_subject: product.email_subject,
            email_template: product.email_template,
          },
          this.mailInstance
        ).send();
        return `${process.env.URL_SIXBASE_MEMBERSHIP}/acessar/${session.uuid}`;
      }
      if (this.product.id_type === VIDEO_TYPE || this.product.id_type === EBOOK) {
        const session = await this.database.createStudentSession(this.currentStudent.id);
        const hasAstron = await this.database.findAstronWebhook(product.id_user);
        await new ApprovedPayment(
          {
            email: this.currentStudent.email,
            full_name: this.currentStudent.full_name,
            product_name: this.product.name,
            amount: this.charge.price,
            producer_name: product.nickname ? product.nickname : producer.full_name,
            support_email: product.support_email ? product.support_email : producer.email,
            sale_uuid: this.saleItem.uuid,
            token: session.uuid,
            type: hasAstron ? 'astron' : '',
            email_subject: product.email_subject,
            email_template: product.email_template,
          },
          this.mailInstance
        ).send();
        return `${process.env.URL_SIXBASE_MEMBERSHIP}/acessar/${session.uuid}`;
      }
      if (this.product.id_type === ECOMMERCE) {
        const session = await this.database.createStudentSession(this.currentStudent.id);
        const hasOfferName = await this.database.findOfferName(this.saleItem.uuid);
        await new ApprovedPayment(
          {
            email: this.currentStudent.email,
            full_name: this.currentStudent.full_name,
            product_name: hasOfferName ? hasOfferName.name : this.product.name,
            amount: this.charge.price,
            producer_name: this.product.name,
            support_email: product.support_email ? product.support_email : producer.email,
            sale_uuid: this.saleItem.uuid,
            token: session.uuid,
            type: 'ecommerce',
            email_subject: product.email_subject,
            email_template: product.email_template,
          },
          this.mailInstance
        ).send();
        return `${process.env.URL_SIXBASE_MEMBERSHIP}/acessar/${session.uuid}`;
      }
      const plugins = await this.database.findUserPlugins(product.id_user);
      if (plugins.length > 0) {
        const memberkitPlugins = await this.database.findPluginsProduct(
          this.saleItem.id_product,
          plugins
        );
        if (memberkitPlugins.length > 0) {
          await new ApprovedPayment(
            {
              email: this.currentStudent.email,
              full_name: this.currentStudent.full_name,
              product_name: this.product.name,
              amount: this.charge.price,
              producer_name: product.nickname ? product.nickname : producer.full_name,
              support_email: product.support_email ? product.support_email : producer.email,
              sale_uuid: this.saleItem.uuid,
              type: 'external',
              email_subject: product.email_subject,
              email_template: product.email_template,
            },
            this.mailInstance
          ).send();
          return '';
        }
      }

      if (this.currentStudent.status === 'pending') {
        let uuid = null;
        const data = await this.database.findResetStudent(this.currentStudent.id);
        if (!data) {
          const token = await this.database.createResetStudent(this.currentStudent.id);
          uuid = token.uuid;
        } else {
          uuid = data.uuid;
        }
        await new FirstAccess(
          {
            full_name: this.currentStudent.full_name,
            product_name: this.product.name,
            amount: this.charge.price,
            producer_name: product.nickname ? product.nickname : producer.full_name,
            token: uuid,
            email: this.currentStudent.email,
            support_email: product.support_email ? product.support_email : producer.email,
            sale_uuid: this.saleItem.uuid,
          },
          this.mailInstance
        ).send();
        return `${process.env.URL_SIXBASE_MEMBERSHIP}/cadastrar-senha/${uuid}/first`;
      }
      const session = await this.database.createStudentSession(this.currentStudent.id);
      await new ApprovedPayment(
        {
          email: this.currentStudent.email,
          full_name: this.currentStudent.full_name,
          product_name: this.product.name,
          amount: this.charge.price,
          producer_name: product.nickname ? product.nickname : producer.full_name,
          support_email: product.support_email ? product.support_email : producer.email,
          token: session.uuid,
          sale_uuid: this.saleItem.uuid,
          email_subject: product.email_subject,
          email_template: product.email_template,
        },
        this.mailInstance
      ).send();
      return `${process.env.URL_SIXBASE_MEMBERSHIP}/acessar/${session.uuid}`;
    } else {
      console.log('email desativado para usuário', product.id_user)
    }
  }
}
