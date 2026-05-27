import { doc, getDoc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

// Tipagem baseada estritamente no SRS v1.4
export type GameState = 'LOBBY' | 'THEME_VOTING' | 'CONTEXT_REVEAL' | 'TYPING_ROUND_1' | 'TTS_ROUND_1' | 'VOTING_ROUND_1' | 'SCORING_REVEAL_1' | 'TYPING_ROUND_2' | 'TTS_ROUND_2' | 'VOTING_ROUND_2' | 'SCORING_REVEAL_2' | 'LEADERBOARD';

interface PlayerPayload {
  name: string;
  avatar: string;
  team: 'TIME_A' | 'TIME_B' | null;
  secretRole: string | null;
  score: number;
}

export function useRoom() {
  
  // Função auxiliar para gerar o PIN
  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  /**
   * HOST: Cria uma nova sala garantindo unicidade do código
   */
  const createRoom = async (hostUid: string): Promise<string> => {
    let isUnique = false;
    let roomCode = '';

    // Loop de segurança para garantir que não sobrescrevemos uma sala ativa (Risco de Colisão)
    while (!isUnique) {
      roomCode = generateRoomCode();
      const roomRef = doc(db, 'rooms', roomCode);
      const roomSnap = await getDoc(roomRef);
      
      if (!roomSnap.exists()) {
        isUnique = true;
        // Estrutura inicial do documento da sala baseada no SRS
        await setDoc(roomRef, {
          hostId: hostUid,
          gameState: 'LOBBY' as GameState,
          createdAt: serverTimestamp(),
          // O tema e o payload de pontuação serão injetados aqui em fases posteriores
        });
      }
    }
    return roomCode;
  };

  /**
   * MOBILE: Valida a sala e regista o jogador
   */
  const joinRoom = async (roomCode: string, uid: string, payload: { name: string, avatar: string }): Promise<boolean> => {
    const codeUpper = roomCode.toUpperCase();
    const roomRef = doc(db, 'rooms', codeUpper);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      throw new Error('SALA_NAO_ENCONTRADA');
    }

    const data = roomSnap.data();
    if (data.gameState !== 'LOBBY') {
      throw new Error('SALA_JA_INICIOU');
    }

    // Regista o jogador na sub-coleção. Equipa e Papel ficam a null até a fase de sorteio (Iteração 3)
    const playerRef = doc(db, `rooms/${codeUpper}/players`, uid);
    const playerData: PlayerPayload = {
      name: payload.name,
      avatar: payload.avatar,
      team: null,
      secretRole: null,
      score: 0
    };

    await setDoc(playerRef, playerData);
    return true;
  };

  return { createRoom, joinRoom };
}