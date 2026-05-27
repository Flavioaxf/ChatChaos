import { applySecretRole } from '../lib/secretRoles';

describe('Motor de Papéis Secretos (Caos)', () => {
  it('IRRITADO: Deve transformar texto em CAPS LOCK 100% das vezes', () => {
    expect(applySecretRole('meu deus', 'IRRITADO')).toBe('MEU DEUS');
  });

  it('NENHUM: Deve devolver a string intacta se o papel não intervir', () => {
    expect(applySecretRole('Hello World', null)).toBe('Hello World');
  });

  it('HACKEADO: Espaços não podem ser corrompidos (RF-09)', () => {
    // Math.random forçado a < 0.28 (Sempre corrompe onde for possível)
    jest.spyOn(Math, 'random').mockReturnValue(0.1);
    const result = applySecretRole('a b c', 'HACKEADO');
    
    // As letras viram binário, mas os espaços devem estar lá
    expect(result.length).toBe(5);
    expect(result[1]).toBe(' ');
    expect(result[3]).toBe(' ');
    jest.restoreAllMocks();
  });
});