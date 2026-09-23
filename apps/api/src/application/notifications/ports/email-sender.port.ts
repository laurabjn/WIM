export interface EmailSenderPort {
  send(options: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    piecesJointes?: { nom: string; contenu: string; type?: string }[];
  }): Promise<void>;
}
