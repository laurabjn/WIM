import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { EmailSenderPort } from '../../application/notifications/ports/email-sender.port';

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim(),
  );
}

@Injectable()
export class NodemailerEmailSender implements EmailSenderPort, OnModuleInit {
  private readonly logger = new Logger(NodemailerEmailSender.name);
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    const port = Number(process.env.SMTP_PORT || 587);

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.transporter.verify();

      this.logger.log(
        `SMTP joignable sur ${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587}`,
      );
    } catch (error) {
      this.logger.warn(
        `SMTP injoignable (${process.env.SMTP_HOST}) : ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
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
