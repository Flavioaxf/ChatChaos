import { describe, it, expect } from 'vitest';
import { assignTeamsAndRoles } from './game-logic';

describe('Lógica de Distribuição de Times e Papéis (SRS RN-06 e RN-07)', () => {
  it('deve dividir os jogadores em dois times de forma equilibrada', () => {
    const uids = ['uid_1', 'uid_2', 'uid_3', 'uid_4', 'uid_5'];
    const result = assignTeamsAndRoles(uids);

    const timeA = Object.values(result).filter(p => p.team === 'TIME_A');
    const timeB = Object.values(result).filter(p => p.team === 'TIME_B');

    // Em 5 jogadores, a soma tem que ser 5 e a diferença entre os times não pode ser maior que 1
    expect(timeA.length + timeB.length).toBe(5);
    expect(Math.abs(timeA.length - timeB.length)).toBeLessThanOrEqual(1);
  });

  it('deve atribuir um papel caótico válido para cada jogador', () => {
    const validRoles = ['IRRITADO', 'HACKEADO', 'BEBADO', 'MANDARIM'];
    const uids = ['uid_1', 'uid_2', 'uid_3'];
    const result = assignTeamsAndRoles(uids);

    Object.values(result).forEach(player => {
      expect(validRoles).toContain(player.secretRole);
    });
  });
});