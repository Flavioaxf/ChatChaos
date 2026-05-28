import { describe, it, expect } from 'vitest';
import { generateAdwarePayload } from './adware-generator';

describe('Gerador de AdwarePayload (SRS Secao 9)', () => {
  it('deve gerar entre 2 e 5 itens de adware', () => {
    // Executamos 100 vezes para cobrir a aleatoriedade e garantir os limites matemáticos
    for (let i = 0; i < 100; i++) {
      const payload = generateAdwarePayload();
      expect(payload.length).toBeGreaterThanOrEqual(2);
      expect(payload.length).toBeLessThanOrEqual(5);
    }
  });

  it('deve estruturar os objetos de adware corretamente conforme o contrato', () => {
    const payload = generateAdwarePayload();
    const item = payload[0];

    expect(item).toHaveProperty('id');
    expect(item.id).toContain('adw_');
    expect(item).toHaveProperty('windowTitle');
    expect(item).toHaveProperty('imgSrc');
    expect(item.position).toHaveProperty('x');
    expect(item.position).toHaveProperty('y');
    expect(item.size).toHaveProperty('width');
    expect(item.size).toHaveProperty('height');
    expect(typeof item.animationDelay).toBe('number');
    expect(typeof item.closeable).toBe('boolean');
  });

  it('deve gerar atrasos de animacao (delay) em cascata', () => {
    const payload = generateAdwarePayload();
    if (payload.length > 1) {
      expect(payload[1].animationDelay).toBeGreaterThan(payload[0].animationDelay);
    }
  });
});