import { GetMyChatsUseCase } from 'src/application/message/use-cases/get-my-chat.usecase';

describe('GetMyChatsUseCase, distinction entre demande et conversation', () => {
  const moi = 'moi';

  const autre = {
    userId: 'elle',
    user: {
      id: 'elle',
      firstName: 'Lea',
      lastName: 'Martin',
      avatarUrl: null,
      statusText: null,
      statusUpdatedAt: null,
    },
  };

  function chat(surcharges: Record<string, unknown> = {}) {
    return {
      id: 'chat-1',
      matchId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      participants: [
        { userId: moi, user: { id: moi } },
        autre,
      ],
      messages: [
        {
          id: 'message-1',
          chatId: 'chat-1',
          senderId: 'elle',
          content: 'Bonjour',
          type: 'TEXT',
          attachmentUrl: null,
          attachmentDurationMs: null,
          editedAt: null,
          replyTo: null,
          sender: {
            id: 'elle',
            firstName: 'Lea',
            lastName: 'Martin',
            avatarUrl: null,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      ...surcharges,
    };
  }

  function creer(unChat: Record<string, unknown>, aRepondu = false) {
    const chatRepository = {
      findByUserId: jest.fn().mockResolvedValue([unChat]),
      countUnreadMessages: jest.fn().mockResolvedValue(0),
      hasUserReplied: jest.fn().mockResolvedValue(aRepondu),
    };

    const blockedUsers = {
      getHiddenUserIds: jest.fn().mockResolvedValue([]),
    };

    return new GetMyChatsUseCase(
      chatRepository as never,
      blockedUsers as never,
    );
  }

  it('compte comme demande un message reste sans reponse', async () => {
    const [resultat] = await creer(chat()).execute(moi);

    expect(resultat.isRequest).toBe(true);
  });

  it('ne compte plus comme demande des lors qu on a repondu', async () => {
    const [resultat] = await creer(chat(), true).execute(moi);

    expect(resultat.isRequest).toBe(false);
  });

  it('ne compte pas comme demande une conversation nee d un match', async () => {
    const [resultat] = await creer(chat({ matchId: 'match-1' })).execute(moi);

    expect(resultat.isRequest).toBe(false);
  });

  it('ne compte pas comme demande un match que personne n a ouvert', async () => {
    const [resultat] = await creer(chat({ messages: [] })).execute(moi);

    expect(resultat.isRequest).toBe(false);
  });

  it('masque une conversation avec un compte bloque', async () => {
    const chatRepository = {
      findByUserId: jest.fn().mockResolvedValue([chat()]),
      countUnreadMessages: jest.fn().mockResolvedValue(0),
      hasUserReplied: jest.fn().mockResolvedValue(false),
    };

    const blockedUsers = {
      getHiddenUserIds: jest.fn().mockResolvedValue(['elle']),
    };

    const useCase = new GetMyChatsUseCase(
      chatRepository as never,
      blockedUsers as never,
    );

    await expect(useCase.execute(moi)).resolves.toEqual([]);
  });
});
