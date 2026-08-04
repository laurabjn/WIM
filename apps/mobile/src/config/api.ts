// Adresse unique de l'API pour toute l'application.
//
// La valeur vient de EXPO_PUBLIC_API_URL, injectée au moment du build :
//   - builds EAS   -> définie par profil dans eas.json
//   - dev local    -> définie dans apps/mobile/.env
//
// Le repli ci-dessous ne concerne que le développement sur simulateur. Il était
// auparavant recopié dans chaque fichier d'API, avec trois valeurs divergentes
// (localhost, 10.0.2.2, une IP de réseau privé) : les builds distribués
// pointaient donc vers des adresses injoignables depuis l'appareil de
// l'utilisateur.
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3002/api';