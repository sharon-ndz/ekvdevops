import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { appConstants, emailConstant } from '../constants/constants';
import { MESSAGES } from '../constants/messages';
import emailTpl from '../templates/email.tpl';
import paymentTpl from '../templates/payment.tpl';
import { convert } from 'html-to-text';
import AttachmentUtils from './aws.s3';
import { v4 as uuidv4 } from 'uuid';
import { EmailStatus } from '../constants/enums';
import { Attachment } from '../interfaces/all.interface';
import { EmailNotification } from '../../entities/email-notification.entity';
import { Repository } from 'typeorm';
import { sendEmailNotification } from './notifications';

@Injectable()
export class MailHelper {
  private to: string;
  private subject: string;
  private message: string;
  private attachments: Attachment[] = [];
  private extras: any;
  private emailNotificationRepository: Repository<EmailNotification>;

  private formatMessage(template: string, data: object): string {
    for (const key in data) {
      const value = data[key];
      const re = new RegExp('{{' + key + '}}', 'g');
      template = template.replace(re, value);
    }
    return template;
  }

  setTo(_to: string): MailHelper {
    this.to = _to;
    return this;
  }

  setSubject(_subject: string): MailHelper {
    this.subject = _subject;
    return this;
  }

  setExtras(_extras: any): MailHelper {
    this.extras = _extras;
    this.extras['payee'] = this.to;
    return this;
  }

  setEmailNotificationRepository(
    _emailNotificationRepository: Repository<EmailNotification>,
  ): MailHelper {
    this.emailNotificationRepository = _emailNotificationRepository;
    return this;
  }

  setBase64Attachment(filename: string, raw: string, contentType?: string): MailHelper {
    this.attachments.push({
      filename: filename, // Replace with your preferred filename
      content: Buffer.from(raw, 'base64'),
      encoding: 'base64',
      contentType: contentType,
    });
    return this;
  }

  setMessage(_message: string): MailHelper {
    this.message = _message;
    return this;
  }

  private async setAttachments(attachments: Attachment[]) {
    // upload files to s3
    const attachedDocuments: Attachment[] = [];
    for (let index = 0; index < attachments.length; index++) {
      const attachment = attachments[index];
      const fileName = `${uuidv4()}-${attachment.filename}`;

      const awsS3bucket = new AttachmentUtils();
      await awsS3bucket.uploadBase64({
        base64String: attachment.content.toString('base64'),
        objectKey: fileName,
        stringContent: true,
      });

      // set the attachment for the email notification
      attachedDocuments.push({
        filename: attachment.filename,
        path: fileName,
        encoding: attachment.encoding,
      });
    }
    this.attachments = []; // clear the files after attaching them to the mail
    return attachedDocuments;
  }

  async sendDefault(): Promise<any> {
    if (this.to == null) {
      throw new InternalServerErrorException('to must not be null');
    }
    if (this.subject == null) {
      throw new InternalServerErrorException('subject must not be null');
    }
    if (this.message == null) {
      throw new InternalServerErrorException('message must not be null');
    }

    const attachments = await this.setAttachments(this.attachments);
    const emailData = {
      header: this.subject, //message subject
      message: this.message,
      date: new Date().toLocaleString('en-NG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
      }),
      app_name: appConstants.appName,
      sitelink: appConstants.siteLink,
      disclaimer: MESSAGES.mailDisclaimer,
    };

    const template: string = this.formatMessage(emailTpl, emailData);
    const text = convert(this.message);
    return await this.send(text, template, attachments);
  }

  async sendTransactionReceipt(): Promise<any> {
    if (this.to == null) {
      throw new InternalServerErrorException('to must not be null');
    }
    if (this.subject == null) {
      throw new InternalServerErrorException('subject must not be null');
    }
    if (this.extras == null) {
      throw new InternalServerErrorException('extras must not be null');
    }

    // upload files to s3
    const attachments = await this.setAttachments(this.attachments);

    const emailData = {
      header: this.subject, //message subject
      message: this.message,
      date: new Date().toLocaleString('en-NG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
      }),
      app_name: appConstants.appName,
      sitelink: appConstants.siteLink,
      disclaimer: MESSAGES.mailDisclaimer,
      ...this.extras,
    };

    const template: string = this.formatMessage(paymentTpl, emailData);
    const text = convert(this.message);
    return await this.send(text, template, attachments);
  }

  private async send(text: string, template: string, attachments: Attachment[]): Promise<any> {
    let emailID = null;
    try {
      const emailNotification = new EmailNotification();
      emailNotification.from = emailConstant.sender;
      emailNotification.to = this.to;
      // Subject line
      emailNotification.subject = this.subject;
      // plain text body
      emailNotification.text = text;
      // html body
      emailNotification.html = `${template}`;
      emailNotification.status = EmailStatus.Pending;
      emailNotification.attachments = attachments;
      // attachments array
      const email = await this.emailNotificationRepository.insert(emailNotification);
      await sendEmailNotification({ id: email.raw[0].id });

      emailID = email.raw[0].id;
    } catch (error: any) {
      console.log(error);
      return { success: false, message: error.message };
    }
    return { success: true, message: `Email Created for: ${this.to}`, emailID };
  }
}
