import { MessageReminderService } from 'src/application/message/services/message-reminder.service';

const JOUR_MS = 24 * 60 * 60 * 1000;

describe('MessageReminderService', () => {
  function conversation(surcharges: Record<string, unknown> = {}) {
    return {
      id: 'chat-1',
      participants: [
        { id: 'p-lea', userId: 'lea', reminderSentAt: null },
        { id: 'p-tom', userId: 'tom', reminderSentAt: null },
      ],
      messages: [
        {
          senderId: 'lea',
          createdAt: new Date(Date.now() - 3 * JOUR_MS),
          content: 'Bonjour',
          sender: { firstName: 'Lea' },
        },
      ],
      ...surcharges,
    };
  }

  function creer(conversations: unknown[]) {
    const prisma = {
      chat: { findMany: jest.fn().mockResolvedValue(conversations) },
      chatParticipant: { update: jest.fn().mockResolvedValue({}) },
    };

    const pushSender = { sendToUser: jest.fn().mockResolvedValue(undefined) };

    return {
      prisma,
      pushSender,
      service: new MessageReminderService(prisma as never, pushSender as never),
    };
  }

  it('relance celui qui n a pas repondu, pas celui qui a ecrit', async () => {
    const { pushSender, service } = creer([conversation()]);

    await expect(service.appliquer()).resolves.toBe(1);

    expect(pushSender.sendToUser).toHaveBeenCalledWith(
      'tom',
      expect.objectContaining({ data: { chatId: 'chat-1' } }),
    );
  });

  it('nomme l auteur du message quand il est connu', async () => {
    const { pushSender, service } = creer([conversation()]);

    await service.appliquer();

    expect(pushSender.sendToUser).toHaveBeenCalledWith(
      'tom',
      expect.objectContaining({
        body: 'Lea vous a écrit et attend votre réponse.',
      }),
    );
  });

  it('reste comprehensible quand le prenom manque', async () => {
    const sansPrenom = conversation({
      messages: [
        {
          senderId: 'lea',
          createdAt: new Date(Date.now() - 3 * JOUR_MS),
          content: 'Bonjour',
          sender: { firstName: null },
        },
      ],
    });

    const { pushSender, service } = creer([sansPrenom]);

    await service.appliquer();

    expect(pushSender.sendToUser).toHaveBeenCalledWith(
      'tom',
      expect.objectContaining({
        body: 'Un message attend votre réponse.',
      }),
    );
  });

  it('ne relance pas deux fois pour le meme message', async () => {
    const dejaRelance = conversation({
      participants: [
        { id: 'p-lea', userId: 'lea', reminderSentAt: null },
        { id: 'p-tom', userId: 'tom', reminderSentAt: new Date() },
      ],
    });

    const { pushSender, service } = creer([dejaRelance]);

    await expect(service.appliquer()).resolves.toBe(0);
    expect(pushSender.sendToUser).not.toHaveBeenCalled();
  });

  it('relance a nouveau si un message plus recent est reste sans reponse', async () => {
    const nouvelleRelance = conversation({
      participants: [
        { id: 'p-lea', userId: 'lea', reminderSentAt: new Date(Date.now() - 10 * JOUR_MS) },
        { id: 'p-tom', userId: 'tom', reminderSentAt: new Date(Date.now() - 10 * JOUR_MS) },
      ],
    });

    const { service } = creer([nouvelleRelance]);

    await expect(service.appliquer()).resolves.toBe(1);
  });

  it('laisse le temps de repondre a un message recent', async () => {
    const recente = conversation({
      messages: [
        {
          senderId: 'lea',
          createdAt: new Date(),
          content: 'Bonjour',
          sender: { firstName: 'Lea' },
        },
      ],
    });

    const { pushSender, service } = creer([recente]);

    await expect(service.appliquer()).resolves.toBe(0);
    expect(pushSender.sendToUser).not.toHaveBeenCalled();
  });

  it('ignore une conversation sans message', async () => {
    const { service } = creer([conversation({ messages: [] })]);

    await expect(service.appliquer()).resolves.toBe(0);
  });

  it('note la relance pour ne pas la repeter au prochain passage', async () => {
    const { prisma, service } = creer([conversation()]);

    await service.appliquer();

    expect(prisma.chatParticipant.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'p-tom' } }),
    );
  });

  it('n interrompt pas la tournee quand une notification echoue', async () => {
    const { pushSender, service } = creer([conversation()]);
    pushSender.sendToUser.mockRejectedValue(new Error('appareil injoignable'));

    await expect(service.appliquer()).resolves.toBe(1);
  });
});
