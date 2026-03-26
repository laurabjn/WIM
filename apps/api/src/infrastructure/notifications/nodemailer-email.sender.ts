import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { EmailSenderPort } from '../../application/notifications/ports/email-sender.port';

@Injectable()
export class NodemailerEmailSender implements EmailSenderPort {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async send(options: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
  }): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || '"WIM" <no-reply@wim.app>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  }
}
