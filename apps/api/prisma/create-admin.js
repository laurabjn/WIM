/**
 * Cree ou promeut un compte administrateur.
 *
 * Le mot de passe est lu dans l'environnement et jamais ecrit dans le script :
 * il n'a a figurer ni dans le depot ni dans un journal.
 *
 * Usage, depuis le conteneur de l'API :
 *
 *   ADMIN_ACCOUNT_EMAIL=... ADMIN_ACCOUNT_PASSWORD=... node prisma/create-admin.js
 *
 * Relance sans risque : un compte existant est promu, son mot de passe
 * remplace, et rien d'autre n'est touche.
 */
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

  // Douze caracteres : ce compte peut suspendre n'importe qui, il ne merite
  // pas le mot de passe d'un compte ordinaire.
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
      // Un compte d'administration ne se decouvre pas au swipe et n'a pas a
      // apparaitre dans les recherches.
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
