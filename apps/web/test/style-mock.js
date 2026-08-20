// Les modules CSS ne sont pas du JavaScript : Jest ne sait pas les analyser.
// Ce mandataire rend le nom de la classe demandee, ce qui suffit aux tests et
// evite d'ajouter une dependance juste pour cela.
module.exports = new Proxy(
  {},
  {
    get: (_target, key) => (key === '__esModule' ? false : String(key)),
  },
);
