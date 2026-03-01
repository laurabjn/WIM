import { Injectable } from '@nestjs/common';
import type { EmailSenderPort } from '../../application/notifications/ports/email-sender.port';

@Injectable()
export class ConsoleEmailSender implements EmailSenderPort {
  async send(options: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
  }): Promise<void> {
    console.log('==== EMAIL DEV ====');
    console.log('TO:', options.to);
    console.log('SUBJECT:', options.subject);
    console.log('TEXT:', options.text);
    console.log('HTML:', options.html);
    console.log('===================');
  }
}
