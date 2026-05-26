import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, onSnapshot, collection } from 'firebase/firestore';
import { ref, onDisconnect } from 'firebase/database';
import { db, rtdb, signInSilently } from '@/lib/firebase';
import { Player } from '@/types/game';

// RNF-08: Avatares exclusivamente em caracteres ASCII
const AVATARS = ['[ >_< ]', '[ @_@ ]', '[ ^_^ ]', '[ o_o ]', '[ -_- ]', '[ T_T ]', '[ $_$ ]', '[ *_* ]'];

const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
};

export const useRoom = (roomCode?: string) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<string>('LOBBY');
  const [currentTheme, setCurrentTheme] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Listener reativo da sala e subcoleção de jogadores
  useEffect(() => {
    if (!roomCode) return;
    const roomRef = doc(db, 'rooms', roomCode);
    const unsubRoom = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGameState(data.gameState);
        setCurrentTheme(data.currentTheme || null);
      }
    });

    const playersRef = collection(db, `rooms/${roomCode}/players`);
    const unsubPlayers = onSnapshot(playersRef, (snapshot) => {
      const p = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Player));
      setPlayers(p);
    });

    return () => { unsubRoom(); unsubPlayers(); };
  }, [roomCode]);

  // Exclusivo do Telão (RN-01)
  const createRoom = async () => {
    setIsLoading(true);
    try {
      const code = generateRoomCode();
      await setDoc(doc(db, 'rooms', code), {
        gameState: 'LOBBY',
        currentTheme: null,
        timerEndsAt: null,
        createdAt: new Date().toISOString()
      });
      return code;
    } finally {
      setIsLoading(false);
    }
  };

  // Exclusivo do Mobile
  const joinRoom = async (code: string, playerName: string) => {
    setIsLoading(true);
    try {
      const roomRef = doc(db, 'rooms', code);
      const roomSnap = await getDoc(roomRef);
      
      if (!roomSnap.exists()) throw new Error('Sala não encontrada');
      if (roomSnap.data().gameState !== 'LOBBY') throw new Error('A partida já está em andamento');

      const user = await signInSilently();
      const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];

      await setDoc(doc(db, `rooms/${code}/players`, user.uid), {
        id: user.uid,
        name: playerName,
        avatar,
        team: null,
        secretRole: null,
        score: 0
      });

      // RNF-12: Configura a remoção dos dados efêmeros se o usuário perder a conexão abruptamente
      const cursorRef = ref(rtdb, `rooms/${code}/liveData/cursors/${user.uid}`);
      const isTypingRef = ref(rtdb, `rooms/${code}/liveData/isTyping/${user.uid}`);
      onDisconnect(cursorRef).remove();
      onDisconnect(isTypingRef).remove();

      return user.uid;
    } finally {
      setIsLoading(false);
    }
  };

  return { createRoom, joinRoom, players, gameState, currentTheme, isLoading };
};