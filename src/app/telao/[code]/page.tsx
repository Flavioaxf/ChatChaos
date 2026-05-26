'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRoom } from '@/hooks/useRoom'; // Nosso hook de Firestore
import { useGameFlow } from '@/hooks/useGameFlow';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '@/lib/firebase';

import TelaoLobbyScreen from '../../../components/screens/telao/telao-lobby-screen';
import TelaoContextScreen from '../../../components/screens/telao/telao-context-screen';
import TelaoMatchScreen from '../../../components/screens/telao/telao-match-screen';
import TelaoResultsScreen from '../../../components/screens/telao/telao-results-screen';

export default function TelaoJogoPage() {
  const params = useParams();
  const roomCode = (params.code as string).toUpperCase();
  
  // 1. Conecta ao Firebase (Firestore)
  const { players, roomData } = useRoom(roomCode);
  const { startGame } = useGameFlow(roomCode);
  
  // 2. Estados reativos do RTDB para o jogo
  const [currentTextLive, setCurrentTextLive] = useState<string>('');
  const [activeCursors, setActiveCursors] = useState<any[]>([]);

  // Listener para o texto em tempo real (digitação)
  useEffect(() => {
    if (!roomCode) return;
    const textRef = ref(rtdb, `rooms/${roomCode}/liveData/currentText`);
    return onValue(textRef, (snapshot) => setCurrentTextLive(snapshot.val() || ''));
  }, [roomCode]);

  // Listener para cursores (localização dos jogadores)
  useEffect(() => {
    if (!roomCode || !players.length) return;
    const cursorsRef = ref(rtdb, `rooms/${roomCode}/liveData/cursors`);
    return onValue(cursorsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) { setActiveCursors([]); return; }
      
      const mapped = Object.entries(data).map(([uid, val]: any) => ({
        playerId: uid,
        playerName: val.nickname,
        color: val.color,
        avatar: players.find(p => p.id === uid)?.avatar || '(?)'
      }));
      setActiveCursors(mapped);
    });
  }, [roomCode, players]);

  if (!roomData) {
    return <div className="h-screen flex items-center justify-center font-pixel text-4xl text-[#FF6B35] bg-[#1C1C1C]">INICIALIZANDO_MAINFRAME...</div>;
  }

  // A RENDERIZAÇÃO AGORA OBEDECE AO FIREBASE
  switch (roomData.gameState) {
    case 'LOBBY':
      return <TelaoLobbyScreen roomCode={roomCode} players={players as any} onStartGame={startGame} />;

    case 'CONTEXT_REVEAL':
      return (
        <TelaoContextScreen
          theme={roomData.currentTheme || "..."}
          contextText={roomData.currentTemplate || "..."}
          players={players as any}
          onSequenceComplete={() => {}} // Futuro acoplamento para advanceState
        />
      );

    case 'TYPING_ROUND_1':
    case 'TYPING_ROUND_2':
      return (
        <TelaoMatchScreen 
          currentRound={roomData.gameState === 'TYPING_ROUND_1' ? 1 : 2}
          activeTeam={roomData.gameState === 'TYPING_ROUND_1' ? "TIME_A" : "TIME_B"}
          theme={roomData.currentTheme || ''}
          currentText={currentTextLive}
          timeLeft={30} // A ser acoplado via timer do Firestore
          activeCursors={activeCursors}
        />
      );

    case 'SCORING_REVEAL_1':
    case 'LEADERBOARD':
      return (
        <TelaoResultsScreen 
          playersRanked={players as any}
          onPlayAgain={() => {}}
        />
      );

    default:
      return <div className="text-white">ESTADO: {roomData.gameState}</div>;
  }
}