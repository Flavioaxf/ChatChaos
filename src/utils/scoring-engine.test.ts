import { describe, it, expect } from 'vitest';
import { calculateScoreEngine } from './scoring-engine';
import { Player } from '@/types/game';

describe('Motor de Apuração (SRS Seção 8 - scoringPayload)', () => {
  it('deve calcular corretamente os votos, ignorando templates e somando pontuações', () => {
    // 1. Setup dos dados simulados (Mocks)
    const players: Player[] = [
      { id: 'uid_ana', name: 'Ana', avatar: 'A', team: 'TIME_A', secretRole: null, score: 0 },
      { id: 'uid_bruno', name: 'Bruno', avatar: 'B', team: 'TIME_A', secretRole: null, score: 0 },
    ];

    const templateText = "A senha do cofre é";
    const finalText = "A senha do cofre é PUDIM 123";
    
    // Mapeamento interno: a palavra no índice 5 ("PUDIM") foi escrita pela Ana, e o índice 6 ("123") pelo Bruno
    const wordAuthors: Record<number, string> = {
      5: 'uid_ana',
      6: 'uid_bruno'
    };

    const rawVotes = [
      { wordIndex: 5, category: 'CAOTICO' },
      { wordIndex: 5, category: 'CAOTICO' },
      { wordIndex: 5, category: 'BOM_TROCADILHO' }, // 3 votos para Ana
      { wordIndex: 6, category: 'INESPERADO' }      // 1 voto para Bruno
    ];

    // 2. Execução
    const payload = calculateScoreEngine(1, finalText, templateText, players, wordAuthors, rawVotes);

    // 3. Validações (Asserts)
    expect(payload.round).toBe(1);
    expect(payload.totalWords).toBe(7); // "A senha do cofre é PUDIM 123" = 7 palavras
    
    // Valida a palavra do template (não deve ter autor nem pontos)
    expect(payload.words[0].word).toBe("A");
    expect(payload.words[0].isTemplate).toBe(true);
    expect(payload.words[0].voteCount).toBe(0);
    
    // Valida a palavra da Ana (índice 5)
    expect(payload.words[5].word).toBe("PUDIM");
    expect(payload.words[5].isTemplate).toBe(false);
    expect(payload.words[5].authorName).toBe("Ana");
    expect(payload.words[5].voteCount).toBe(3);
    expect(payload.words[5].voteCategories).toEqual(
      expect.arrayContaining([
        { category: 'CAOTICO', count: 2 },
        { category: 'BOM_TROCADILHO', count: 1 }
      ])
    );

    // Valida o placar geral final calculado
    expect(payload.playerScores['uid_ana']).toBe(3);
    expect(payload.playerScores['uid_bruno']).toBe(1);
  });
});