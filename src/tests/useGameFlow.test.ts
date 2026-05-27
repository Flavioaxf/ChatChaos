import { renderHook, act } from '@testing-library/react-hooks';
import { useGameFlow, Player } from '../hooks/useGameFlow';
import * as firestore from 'firebase/firestore';

// Mocks do Firebase Firestore
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  collection: jest.fn(),
  onSnapshot: jest.fn(() => jest.fn()), // retorna unsubscribe
  updateDoc: jest.fn(),
  writeBatch: jest.fn(() => ({
    update: jest.fn(),
    commit: jest.fn().mockResolvedValue(true),
  })),
  getFirestore: jest.fn(),
}));

describe('useGameFlow - Regras de Negócio do Host', () => {
  const mockRoomCode = 'CAOS';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Não deve permitir iniciar a partida com menos de 3 jogadores (RN-02)', async () => {
    const { result } = renderHook(() => useGameFlow(mockRoomCode));
    
    // Forçamos o hook a ter apenas 2 jogadores através de manipulação interna do teste
    // Na prática, isto simula o onSnapshot a devolver apenas 2 jogadores
    act(() => {
      // @ts-ignore - Acesso para fins de teste
      result.current.players = [
        { id: '1', name: 'A', avatar: '', score: 0, team: null, secretRole: null },
        { id: '2', name: 'B', avatar: '', score: 0, team: null, secretRole: null }
      ];
    });

    await act(async () => {
      await result.current.hostResolveThemeAndStartMatch('TEMA', 'CONTEXTO');
    });

    expect(firestore.writeBatch).not.toHaveBeenCalled();
  });

  it('Deve dividir as equipas de forma equilibrada (Metade A, Metade B)', async () => {
    const { result } = renderHook(() => useGameFlow(mockRoomCode));
    
    // Simular 5 jogadores (O esperado é 3 para o Time A e 2 para o Time B)
    const mockPlayers: Player[] = Array.from({ length: 5 }).map((_, i) => ({
      id: `uid_${i}`, name: `Player ${i}`, avatar: '', score: 0, team: null, secretRole: null
    }));

    act(() => {
      // @ts-ignore
      result.current.players = mockPlayers;
    });

    const batchMock = firestore.writeBatch(firestore.getFirestore() as any);

    await act(async () => {
      await result.current.hostResolveThemeAndStartMatch('TESTE', 'TEMPLATE');
    });

    expect(batchMock.commit).toHaveBeenCalled();

    // Inspeciona as chamadas do batch.update para validar as equipas atribuídas
    const updateCalls = (batchMock.update as jest.Mock).mock.calls;
    
    let timeACount = 0;
    let timeBCount = 0;

    // As atualizações dos jogadores são as primeiras 5 chamadas no batch
    for (let i = 0; i < 5; i++) {
      const payload = updateCalls[i][1];
      if (payload.team === 'TIME_A') timeACount++;
      if (payload.team === 'TIME_B') timeBCount++;
      
      // Valida o sorteio do Papel (RF-07)
      expect(['IRRITADO', 'HACKEADO', 'BEBADO', 'MANDARIM']).toContain(payload.secretRole);
    }

    // Regra RN-06: Divisão equilibrada (Math.ceil(5/2) = 3)
    expect(timeACount).toBe(3);
    expect(timeBCount).toBe(2);
  });
});