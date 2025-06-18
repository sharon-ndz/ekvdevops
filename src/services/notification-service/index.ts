import { createTransport } from 'nodemailer';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailNotification } from '../../entities/email-notification.entity';
import { EmailStatus } from '../../core/constants/enums';

export class NotificationService {
  constructor(
    @InjectRepository(EmailNotification)
    private readonly emailNotificationRepository: Repository<EmailNotification>,
  ) {}

  async sendEmail({ to, from, text, html, subject, bcc }) {
    try {
      const transporter = createTransport({
        secure: Boolean(process.env.EMAIL_SECURE),
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      console.log('SENDING EMAIL TO', to);
      console.log('BCC EMAIL', bcc);
      const sendMailResult = await transporter.sendMail({
        from: from,
        to: to,
        subject,
        html: html,
        text: text,
        bcc,
      });

      console.log('SEND MAIL RESULT', sendMailResult);
      console.log('NOTIFICATION SENT AND UPDATED STATUS CORRECTLY');
      return sendMailResult;
    } catch (e) {
      console.log('ERROR: ', e);
      throw e;
    }
  }

  async main(notificationId: number) {
    console.log({ notificationId: notificationId });
    try {
      const notification = await this.emailNotificationRepository.findOne({
        where: { id: notificationId, status: EmailStatus.Pending },
      });
      if (!notification) {
        console.log('NOTIFICATION NOT FOUND', notificationId);
        return 'Notification not found';
      }
      console.log({ notification });
      // Pull needed info from notification
      const { id, from, subject, to, html, text } = notification;
      // Set to processing
      await this.emailNotificationRepository.update({ id: id }, { status: EmailStatus.Processing });
      await this.sendEmail({ to, from, text, html, subject, bcc: '' });
      // Sent to completed if no error
      await this.emailNotificationRepository.update({ id: id }, { status: EmailStatus.Completed });
      return 'Notification sent';
    } catch (e) {
      console.log('Error sending notification', e);
      // Update status to failed
      await this.emailNotificationRepository.update(
        { id: notificationId },
        { status: EmailStatus.Failed },
      );
      return 'Error while sending notification';
    }
  }
}
