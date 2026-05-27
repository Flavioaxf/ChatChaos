import { useRoom } from '../hooks/useRoom';
// Mock da base de dados Firebase omitido por brevidade

describe('Casos de Uso: Sala e Lobby', () => {
  const { createRoom, joinRoom } = useRoom();

  it('Deve criar uma sala com um código válido de 4 letras maiúsculas', async () => {
    const roomCode = await createRoom('mock-host-uid');
    expect(roomCode).toMatch(/^[A-Z]{4}$/);
  });

  it('Deve permitir a entrada de um jogador num lobby válido', async () => {
    const roomCode = await createRoom('mock-host-uid');
    const success = await joinRoom(roomCode, 'mock-player-uid', { name: 'JOGADOR', avatar: '(O_O)' });
    expect(success).toBe(true);
  });

  it('Deve rejeitar a entrada caso o código da sala não exista', async () => {
    await expect(joinRoom('INVALID', 'mock-uid', { name: 'A', avatar: 'A' }))
      .rejects.toThrow('SALA_NAO_ENCONTRADA');
  });

  it('Deve rejeitar a entrada caso o gameState não seja LOBBY', async () => {
    // Configuração do mock: Forçar a sala para 'THEME_VOTING'
    // ...
    await expect(joinRoom('VALID_CODE', 'mock-uid', { name: 'A', avatar: 'A' }))
      .rejects.toThrow('SALA_JA_INICIOU');
  });
});