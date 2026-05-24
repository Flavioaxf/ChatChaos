import { useEffect, useState, useRef } from 'react';
import { ref, onValue, set, runTransaction } from 'firebase/database';
import { rtdb } from '@/lib/firebase';

export const useSharedText = (roomCode: string, uid?: string) => {
  const [text, setText] = useState('');
  const [cursors, setCursors] = useState<Record<string, { position: number, nickname: string }>>({});
  const [isTypingMap, setIsTypingMap] = useState<Record<string, boolean>>({});
  const [audioFinished, setAudioFinished] = useState(false); 
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!roomCode) return;
    
    const textRef = ref(rtdb, `rooms/${roomCode}/liveData/currentText`);
    const cursorsRef = ref(rtdb, `rooms/${roomCode}/liveData/cursors`);
    const isTypingRef = ref(rtdb, `rooms/${roomCode}/liveData/isTyping`);
    const audioRef = ref(rtdb, `rooms/${roomCode}/liveData/audioFinished`);

    // Adicionado os tipos 'any' para satisfazer o compilador restrito
    const unsubText = onValue(textRef, (snap: any) => setText(snap.val() || ''));
    const unsubCursors = onValue(cursorsRef, (snap: any) => setCursors(snap.val() || {}));
    const unsubIsTyping = onValue(isTypingRef, (snap: any) => setIsTypingMap(snap.val() || {}));
    const unsubAudio = onValue(audioRef, (snap: any) => setAudioFinished(!!snap.val()));

    return () => {
      unsubText(); unsubCursors(); unsubIsTyping(); unsubAudio();
    };
  }, [roomCode]);

  const initTemplate = async (template: string) => {
    const textRef = ref(rtdb, `rooms/${roomCode}/liveData/currentText`);
    await set(textRef, template);
  };

  const appendCharacter = async (char: string) => {
    if (!uid) return;
    const textRef = ref(rtdb, `rooms/${roomCode}/liveData/currentText`);
    
    await runTransaction(textRef, (currentData: string | null) => {
      if (currentData === null) return char;
      if (currentData.length >= 160) return currentData;
      return currentData + char;
    });

    const typingRef = ref(rtdb, `rooms/${roomCode}/liveData/isTyping/${uid}`);
    await set(typingRef, true);
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      await set(typingRef, false);
    }, 400);
  };

  const updateCursor = async (position: number, nickname: string) => {
    if (!uid) return;
    // Corrigido typo (code -> roomCode)
    const cursorRef = ref(rtdb, `rooms/${roomCode}/liveData/cursors/${uid}`);
    await set(cursorRef, { position, nickname });
  };

  return { text, cursors, isTypingMap, audioFinished, appendCharacter, updateCursor, initTemplate };
};