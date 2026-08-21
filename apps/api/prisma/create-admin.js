const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_ACCOUNT_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_ACCOUNT_PASSWORD;
  const firstName = process.env.ADMIN_ACCOUNT_FIRSTNAME?.trim() || 'Admin';
  const lastName = process.env.ADMIN_ACCOUNT_LASTNAME?.trim() || 'Wim';

  if (!email || !password) {
    throw new Error(
      'ADMIN_ACCOUNT_EMAIL et ADMIN_ACCOUNT_PASSWORD sont requis.',
    );
  }

  if (password.length < 12) {
    throw new Error('Le mot de passe doit faire au moins 12 caracteres.');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const compte = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, isAdmin: true, suspendedAt: null },
    create: {
      email,
      passwordHash,
      firstName,
      lastName,
      isAdmin: true,
      profileVisible: false,
    },
    select: { id: true, email: true, isAdmin: true },
  });

  console.log(`[admin] ${compte.email} est administrateur.`);
  console.log('[admin] Deconnectez-vous et reconnectez-vous : le drapeau est');
  console.log('[admin] inscrit dans le jeton au moment de la connexion.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error('[admin] Echec :', error.message);
    await prisma.$disconnect();
    process.exit(1);
  });
