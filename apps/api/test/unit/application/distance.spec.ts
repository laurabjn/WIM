import { distanceEnKm, exprimer } from 'src/shared/utils/distance';

describe('distance', () => {
  it('mesure Paris - Lyon a quelques kilometres pres', () => {
    const km = distanceEnKm(48.8566, 2.3522, 45.764, 4.8357);

    expect(km).toBeGreaterThan(385);
    expect(km).toBeLessThan(400);
  });

  it('exprime en miles quand le compte le demande', () => {
    expect(exprimer(160.9, 'mi')).toEqual({ valeur: 100, unite: 'mi' });
    expect(exprimer(160.9, 'km')).toEqual({ valeur: 161, unite: 'km' });
  });
});
