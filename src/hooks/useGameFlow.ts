import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  writeBatch, 
  doc, 
  updateDoc, 
  onSnapshot 
} from "firebase/firestore";
import { db } from '@/src/lib/firebase';
import { GameState } from "./useRoom";

export interface Player {
  id: string; // Corresponde ao uid do Auth
  name: string;
  avatar: string;
  team: "TIME_A" | "TIME_B" | null;
  secretRole: string | null;
  score: number;
  themeVote?: string; // Campo transitório durante votação
  isActiveThisRound: boolean;
}

export const calculateRoundScores = async (roomCode: string) => {
  if (!roomCode) return;
  const codeUpper = roomCode.toUpperCase();

  const scoringRef = collection(db, `rooms/${codeUpper}/scoringPayload`);
  const votesRef = collection(db, `rooms/${codeUpper}/votes`);
  const playersRef = collection(db, `rooms/${codeUpper}/players`);

  const [scoringSnap, votesSnap, playersSnap] = await Promise.all([
    getDocs(scoringRef),
    getDocs(votesRef),
    getDocs(playersRef)
  ]);

  const scoreMap: Record<string, number> = {};

  votesSnap.forEach((voteDoc) => {
    const voteData = voteDoc.data();
    const { wordId, pointsAwarded } = voteData;
    const wordDoc = scoringSnap.docs.find(d => d.id === wordId);
    
    if (wordDoc) {
      const { authorId } = wordDoc.data();
      if (authorId) {
        scoreMap[authorId] = (scoreMap[authorId] || 0) + (pointsAwarded || 100);
      }
    }
  });

  const batch = writeBatch(db);
  playersSnap.forEach((playerDoc) => {
    const playerId = playerDoc.id;
    const gainedPoints = scoreMap[playerId] || 0;
    
    if (gainedPoints > 0) {
      const currentScore = playerDoc.data().score || 0;
      const playerRef = doc(db, `rooms/${codeUpper}/players`, playerId);
      batch.update(playerRef, { score: currentScore + gainedPoints });
    }
  });

  await batch.commit();
};

export function useGameFlow(roomCode: string | null) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [roomData, setRoomData] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  const calculateRoundScores = async (roomCode: string) => {
    if (!roomCode) return;
    const codeUpper = roomCode.toUpperCase();

    // 1. Referências às coleções
    const scoringRef = collection(db, `rooms/${codeUpper}/scoringPayload`);
    const votesRef = collection(db, `rooms/${codeUpper}/votes`);
    const playersRef = collection(db, `rooms/${codeUpper}/players`);

    // 2. Obter dados (Payload de Palavras e Votos dos utilizadores)
    const [scoringSnap, votesSnap, playersSnap] = await Promise.all([
      getDocs(scoringRef),
      getDocs(votesRef),
      getDocs(playersRef),
    ]);

    // Mapa para acumular pontuação: { authorId: totalPoints }
    const scoreMap: Record<string, number> = {};

    // 3. Cruzamento de dados (Processamento da Regra de Negócio)
    // Cada voto aponta para uma palavra (wordId) que tem um autor (authorId)
    votesSnap.forEach((voteDoc) => {
      const voteData = voteDoc.data();
      const { wordId, pointsAwarded } = voteData;

      // Localizar a palavra no payload para descobrir quem a escreveu
      const wordDoc = scoringSnap.docs.find((d) => d.id === wordId);

      if (wordDoc) {
        const { authorId } = wordDoc.data();
        if (authorId) {
          scoreMap[authorId] =
            (scoreMap[authorId] || 0) + (pointsAwarded || 100);
        }
      }
    });

    // 4. Atualização Atómica dos Jogadores
    const batch = writeBatch(db);

    playersSnap.forEach((playerDoc) => {
      const playerId = playerDoc.id;
      const gainedPoints = scoreMap[playerId] || 0;

      if (gainedPoints > 0) {
        const currentScore = playerDoc.data().score || 0;
        const playerRef = doc(db, `rooms/${codeUpper}/players`, playerId);
        batch.update(playerRef, { score: currentScore + gainedPoints });
      }
    });

    await batch.commit();
    console.log("Apuração finalizada com sucesso.");
  };

  useEffect(() => {
    if (!roomCode) return;
    const codeUpper = roomCode.toUpperCase();

    // 1. OUVINTE DA SALA (Documento Pai)
    const unsubRoom = onSnapshot(doc(db, "rooms", codeUpper), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRoomData(data);
        setGameState(data.gameState);
      }
    });

    // 2. OUVINTE DOS JOGADORES (Sub-coleção)
    const unsubPlayers = onSnapshot(
      collection(db, `rooms/${codeUpper}/players`),
      (colSnap) => {
        const pList: Player[] = [];
        colSnap.forEach((d) => pList.push({ id: d.id, ...d.data() } as Player));
        // Ordenação para garantir consistência visual no Telão (ex: por pontuação ou nome)
        pList.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
        setPlayers(pList);
      },
    );

    return () => {
      unsubRoom();
      unsubPlayers();
    };
  }, [roomCode]);

  // ==========================================
  // ACÇÕES EXCLUSIVAS DO HOST (TELÃO)
  // ==========================================

  // Gatilho 1: Ir do Lobby para a Votação de Temas
  const hostStartThemeVoting = async () => {
    if (!roomCode) return;
    await updateDoc(doc(db, "rooms", roomCode), { gameState: "THEME_VOTING" });
  };

  // Gatilho 2: Encerrar Votação, Sortear Equipas, Papéis e Avançar
  const hostResolveThemeAndStartMatch = async (
    selectedTheme: string,
    contextTemplate: string,
  ) => {
    if (!roomCode || players.length < 3) return;

    // Algoritmo de Fisher-Yates para embaralhar a array
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const middleIndex = Math.ceil(shuffledPlayers.length / 2);

    const batch = writeBatch(db);

    shuffledPlayers.forEach((player, index) => {
      const playerRef = doc(db, `rooms/${roomCode}/players`, player.id);

      // Divisão das Equipes: Metade TIME_A, Metade TIME_B
      const assignedTeam = index < middleIndex ? "TIME_A" : "TIME_B";

      // Sorteio Caótico de Papéis (RF-07)
      const assignedRole =
        AVAILABLE_ROLES[Math.floor(Math.random() * AVAILABLE_ROLES.length)];

      batch.update(playerRef, {
        team: assignedTeam,
        secretRole: assignedRole,
      });
    });

    // Atualiza o documento pai com as configs do Round 1 e avança o estado
    const roomRef = doc(db, "rooms", roomCode);
    batch.update(roomRef, {
      gameState: "CONTEXT_REVEAL",
      currentRound: 1,
      theme: selectedTheme,
      contextText: contextTemplate,
      activeTeam: "TIME_A", // No round 1, Time A digita
    });

    await batch.commit(); // Transação atómica garantida
  };

  const hostPerformSignalSwap = async (roomCode: string) => {
    const playersRef = collection(db, `rooms/${roomCode}/players`);
    const snapshot = await getDocs(playersRef);
    const batch = writeBatch(db);

    snapshot.forEach((doc) => {
      // Inverte o booleano (se true vira false, se false vira true)
      const currentStatus = doc.data().isActiveThisRound;
      batch.update(doc.ref, { isActiveThisRound: !currentStatus });
    });

    // Atualiza o round e o globalEffect
    batch.update(doc(db, "rooms", roomCode), {
      currentRound: 2,
      globalEffect: "SIGNAL_SWAP",
    });

    await batch.commit();
  };

  return {
    gameState,
    roomData,
    players,
    hostStartThemeVoting,
    hostResolveThemeAndStartMatch,
  };
}
