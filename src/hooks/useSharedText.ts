import { useEffect, useState, useRef, useCallback } from 'react';
import { ref, onValue, runTransaction, set } from 'firebase/database';
import { rtdb } from '@/lib/firebase';

export interface CursorData {
  position: number;
  nickname: string;
  color: string;
}

export const useSharedText = (roomCode: string, uid: string) => {
  const [currentText, setCurrentText] = useState<string>('');
  const [cursors, setCursors] = useState<Record<string, CursorData>>({});
  const [activeTypers, setActiveTypers] = useState<Record<string, boolean>>({});
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!roomCode) return;

    const textRef = ref(rtdb, `rooms/${roomCode}/liveData/currentText`);
    const cursorsRef = ref(rtdb, `rooms/${roomCode}/liveData/cursors`);
    const isTypingRef = ref(rtdb, `rooms/${roomCode}/liveData/isTyping`);

    const unsubText = onValue(textRef, (snapshot) => {
      setCurrentText(snapshot.val() || '');
    });

    const unsubCursors = onValue(cursorsRef, (snapshot) => {
      setCursors(snapshot.val() || {});
    });

    const unsubIsTyping = onValue(isTypingRef, (snapshot) => {
      setActiveTypers(snapshot.val() || {});
    });

    return () => {
      unsubText();
      unsubCursors();
      unsubIsTyping();
    };
  }, [roomCode]);

  const appendCharacter = useCallback(async (char: string, playerName: string, color: string) => {
    if (!roomCode || !uid) return;

    const textRef = ref(rtdb, `rooms/${roomCode}/liveData/currentText`);
    
    try {
      await runTransaction(textRef, (currentData) => {
        const baseString = currentData || '';
        if (baseString.length >= 160) {
          return baseString; // Intercepta localmente caso exceda o limite global
        }
        return baseString + char;
      });

      const userIsTypingRef = ref(rtdb, `rooms/${roomCode}/liveData/isTyping/${uid}`);
      const userCursorRef = ref(rtdb, `rooms/${roomCode}/liveData/cursors/${uid}`);

      await set(userIsTypingRef, true);
      
      // O cursor é posicionado artificialmente no final do buffer local + 1
      await set(userCursorRef, { 
        position: currentText.length + 1, 
        nickname: playerName, 
        color 
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(async () => {
        await set(userIsTypingRef, false);
      }, 400);

    } catch (error) {
      console.error("Erro na transação de digitação RTDB:", error);
    }
  }, [roomCode, uid, currentText.length]);

  return { currentText, cursors, activeTypers, appendCharacter };
};