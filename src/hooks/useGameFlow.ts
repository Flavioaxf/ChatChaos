import { doc, updateDoc, writeBatch, collection, getDocs, serverTimestamp, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { ref, set } from 'firebase/database';
import { db, rtdb } from '@/lib/firebase';
import { getRandomTemplate } from '@/data/templates';
import { generateAdwarePayload } from '@/utils/adware-generator';
import { assignTeamsAndRoles } from '@/utils/game-logic';
import { ScoringPayload } from '@/types/game';

export const useGameFlow = (roomCode: string) => {
  const startGame = async () => {
    const playersSnap = await getDocs(collection(db, `rooms/${roomCode}/players`));
    const playerIds = playersSnap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => d.id);
    
    const assignments = assignTeamsAndRoles(playerIds);
    const batch = writeBatch(db);
    
    playerIds.forEach((uid: string) => {
      const pRef = doc(db, `rooms/${roomCode}/players`, uid);
      batch.update(pRef, assignments[uid]);
    });

    const roomRef = doc(db, 'rooms', roomCode);
    batch.update(roomRef, { gameState: 'THEME_VOTING' });

    await batch.commit();
  };

  const advanceState = async (newState: string, extraData: Record<string, any> = {}) => {
    const roomRef = doc(db, 'rooms', roomCode);
    await updateDoc(roomRef, { gameState: newState, ...extraData });
  };

  const startRound = async (roundNum: 1 | 2, theme: string) => {
    const template = getRandomTemplate(theme);
    const state = roundNum === 1 ? 'TYPING_ROUND_1' : 'TYPING_ROUND_2';
    
    const roomRef = doc(db, 'rooms', roomCode);
    await updateDoc(roomRef, {
      gameState: state,
      currentTheme: theme,
      timerEndsAt: serverTimestamp() 
    });

    return template; 
  };

  const startTTSPhase = async (roundNum: 1 | 2) => {
    const audioRef = ref(rtdb, `rooms/${roomCode}/liveData/audioFinished`);
    await set(audioRef, false);

    const state = roundNum === 1 ? 'TTS_ROUND_1' : 'TTS_ROUND_2';
    await advanceState(state);
  };

  const triggerScoringReveal = async (roundNum: 1 | 2, payload: ScoringPayload) => {
    const batch = writeBatch(db);
    const roomRef = doc(db, 'rooms', roomCode);
    
    batch.update(roomRef, { 
      scoringPayload: payload,
      gameState: roundNum === 1 ? 'SCORING_REVEAL_1' : 'SCORING_REVEAL_2' 
    });

    Object.entries(payload.playerScores).forEach(([uid, newScore]) => {
      const playerRef = doc(db, `rooms/${roomCode}/players`, uid);
      batch.update(playerRef, { score: newScore });
    });

    await batch.commit();
  };

  const triggerLeaderboard = async () => {
    const adwarePayload = generateAdwarePayload();
    await advanceState('LEADERBOARD', { adwarePayload });
  };

  return { startGame, advanceState, startRound, startTTSPhase, triggerScoringReveal, triggerLeaderboard };
};