import { 
  doc, 
  updateDoc, 
  writeBatch, 
  collection, 
  getDocs, 
  serverTimestamp, 
  getDoc 
} from 'firebase/firestore';
import { ref, set, get } from 'firebase/database';
import { db, rtdb } from '@/lib/firebase';
import { getRandomTemplate } from '@/data/templates';
import { generateAdwarePayload } from '@/utils/adware-generator';
import { assignTeamsAndRoles } from '@/utils/game-logic';
import { calculateScoreEngine } from '@/utils/scoring-engine';
import { Player, ScoringPayload } from '@/types/game';
import { RawVote } from '@/hooks/useVoting';

export const useGameFlow = (roomCode: string) => {

  const startGame = async () => {
    const playersSnapshot = await getDocs(collection(db, `rooms/${roomCode}/players`));
    const playerIds = playersSnapshot.docs.map(d => d.id);
    
    if (playerIds.length < 3) {
      throw new Error("Mínimo de 3 jogadores necessários para iniciar.");
    }

    const assignments = assignTeamsAndRoles(playerIds);
    const batch = writeBatch(db);
    
    playerIds.forEach((uid) => {
      const playerRef = doc(db, `rooms/${roomCode}/players`, uid);
      batch.update(playerRef, assignments[uid]);
    });

    const roomRef = doc(db, 'rooms', roomCode);
    batch.update(roomRef, { gameState: 'THEME_VOTING' });

    await batch.commit();
  };

  const startRound = async (roundNum: 1 | 2, theme: string) => {
    const template = getRandomTemplate(theme);
    const newState = roundNum === 1 ? 'TYPING_ROUND_1' : 'TYPING_ROUND_2';
    
    const batch = writeBatch(db);
    const roomRef = doc(db, 'rooms', roomCode);
    
    batch.update(roomRef, {
      gameState: newState,
      currentTheme: theme,
      currentTemplate: template,
      timerEndsAt: serverTimestamp() 
    });

    // Reseta o texto compartilhado no início do round
    const textRef = ref(rtdb, `rooms/${roomCode}/liveData/currentText`);
    await set(textRef, template);

    await batch.commit();
  };

  const startTTSPhase = async (roundNum: 1 | 2) => {
    // Garante que o bloqueio dos mobiles esteja ativo ANTES da mudança de tela
    const audioRef = ref(rtdb, `rooms/${roomCode}/liveData/audioFinished`);
    await set(audioRef, false);

    const newState = roundNum === 1 ? 'TTS_ROUND_1' : 'TTS_ROUND_2';
    const roomRef = doc(db, 'rooms', roomCode);
    await updateDoc(roomRef, { gameState: newState });
  };

  const advanceState = async (newState: string) => {
    const roomRef = doc(db, 'rooms', roomCode);
    await updateDoc(roomRef, { gameState: newState });
  };

  const triggerScoringReveal = async (roundNum: 1 | 2) => {
    try {
      // 1. Busca os dados essenciais da sala e dos jogadores
      const roomRef = doc(db, 'rooms', roomCode);
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists()) throw new Error("Sala inexistente.");
      
      const templateText = roomSnap.data().currentTemplate || '';

      const playersSnap = await getDocs(collection(db, `rooms/${roomCode}/players`));
      const players: Player[] = playersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Player));

      // 2. Busca o texto final produzido no RTDB
      const textRef = ref(rtdb, `rooms/${roomCode}/liveData/currentText`);
      const textSnap = await get(textRef);
      const finalText = textSnap.val() || '';

      // 3. Busca a autoria de palavras no RTDB
      const authorsRef = ref(rtdb, `rooms/${roomCode}/liveData/wordAuthors`);
      const authorsSnap = await get(authorsRef);
      const wordAuthors: Record<number, string> = authorsSnap.val() || {};

      // 4. Coleta todos os votos registrados no Firestore para o round atual
      const votesSnap = await getDocs(collection(db, `rooms/${roomCode}/votes`));
      let aggregatedRawVotes: { wordIndex: number; category: string; }[] = [];
      
      votesSnap.docs.forEach(docSnap => {
        const voterData = docSnap.data();
        if (voterData.votes && Array.isArray(voterData.votes)) {
          aggregatedRawVotes = aggregatedRawVotes.concat(voterData.votes);
        }
      });

      // 5. Executa o motor de pontuação isolado
      const payload: ScoringPayload = calculateScoreEngine(
        roundNum,
        finalText,
        templateText,
        players,
        wordAuthors,
        aggregatedRawVotes
      );

      // 6. Prepara o Batch de gravação (Regra 10.3)
      const batch = writeBatch(db);
      
      batch.update(roomRef, { 
        scoringPayload: payload,
        gameState: roundNum === 1 ? 'SCORING_REVEAL_1' : 'SCORING_REVEAL_2' 
      });

      Object.entries(payload.playerScores).forEach(([uid, newScore]) => {
        const pRef = doc(db, `rooms/${roomCode}/players`, uid);
        batch.update(pRef, { score: newScore });
      });

      // Limpa os votos do round processado para não sujar o Round 2
      votesSnap.docs.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });

      await batch.commit();

    } catch (error) {
      console.error("Falha crítica ao consolidar Apuração de Pontos:", error);
    }
  };

  const triggerLeaderboard = async () => {
    const adwarePayload = generateAdwarePayload();
    const batch = writeBatch(db);
    const roomRef = doc(db, 'rooms', roomCode);
    
    // Regra 10.3: O payload do adware é gravado simultaneamente com o avanço de estado
    batch.update(roomRef, { 
      gameState: 'LEADERBOARD', 
      adwarePayload: adwarePayload 
    });
    
    await batch.commit();
  };

  return { 
    startGame, 
    startRound, 
    startTTSPhase, 
    advanceState, 
    triggerScoringReveal, 
    triggerLeaderboard 
  };
};