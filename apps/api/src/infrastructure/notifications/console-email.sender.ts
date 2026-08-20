import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { EmailSenderPort } from '../../application/notifications/ports/email-sender.port';

@Injectable()
export class ConsoleEmailSender implements EmailSenderPort, OnModuleInit {
  private readonly logger = new Logger(ConsoleEmailSender.name);

  onModuleInit(): void {
    // Ce repli affiche le corps des messages, liens de reinitialisation
    // compris : hors developpement, il faut le savoir.
    this.logger.warn(
      'SMTP non configure : les mails ne partent pas et leur contenu, jetons de reinitialisation inclus, est ecrit dans les journaux. Renseignez SMTP_HOST, SMTP_USER et SMTP_PASS.',
    );
  }

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
