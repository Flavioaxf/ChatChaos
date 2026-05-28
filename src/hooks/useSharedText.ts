// src/hooks/useSharedText.ts
import { useEffect, useState } from "react";
import {
  ref,
  onValue,
  runTransaction,
  set,
  onDisconnect,
} from "firebase/database";
import { rtdb } from "@/src/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
// CORREÇÃO 1: db estava sendo usado mas não importado — causava crash silencioso no build
import { db } from "@/src/lib/firebase";

export interface Cursor {
  playerId: string;
  playerName: string;
  color: string;
  avatar: string;
  position: number;
  team?: string;
}

export function useSharedText(roomCode: string | null, uid: string | null) {
  const [currentText, setCurrentText] = useState("");
  const [activeCursors, setActiveCursors] = useState<Cursor[]>([]);
  const [isTypingMap, setIsTypingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!roomCode) return;
    const codeUpper = roomCode.toUpperCase();

    const textRef = ref(rtdb, `rooms/${codeUpper}/liveData/currentText`);
    const unsubText = onValue(textRef, (snap) => {
      if (snap.exists()) setCurrentText(snap.val());
    });

    const cursorsRef = ref(rtdb, `rooms/${codeUpper}/liveData/cursors`);
    const unsubCursors = onValue(cursorsRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        setActiveCursors(
          Object.keys(data).map((key) => ({ playerId: key, ...data[key] }))
        );
      } else {
        setActiveCursors([]);
      }
    });

    const typingRef = ref(rtdb, `rooms/${codeUpper}/liveData/isTyping`);
    const unsubTyping = onValue(typingRef, (snap) => {
      if (snap.exists()) setIsTypingMap(snap.val());
      else setIsTypingMap({});
    });

    return () => {
      unsubText();
      unsubCursors();
      unsubTyping();
    };
  }, [roomCode]);

  const injectTextDelta = async (delta: string, position: number) => {
    if (!roomCode || !delta) return;
    const textRef = ref(
      rtdb,
      `rooms/${roomCode.toUpperCase()}/liveData/currentText`
    );
    await runTransaction(textRef, (currentVal) => {
      if (currentVal === null) return currentVal;
      const safePos = Math.min(position, currentVal.length);
      return currentVal.slice(0, safePos) + delta + currentVal.slice(safePos);
    });
  };

  // CORREÇÃO 2: updateCursor agora aceita team para o Telão filtrar cursores por time
  const updateCursor = async (
    position: number,
    playerInfo: { playerName: string; color: string; avatar: string; team?: string }
  ) => {
    if (!roomCode || !uid) return;
    const cursorRef = ref(
      rtdb,
      `rooms/${roomCode.toUpperCase()}/liveData/cursors/${uid}`
    );
    await set(cursorRef, { position, ...playerInfo });
    onDisconnect(cursorRef).remove();
  };

  const setTypingStatus = async (isTyping: boolean) => {
    if (!roomCode || !uid) return;
    const typingRef = ref(
      rtdb,
      `rooms/${roomCode.toUpperCase()}/liveData/isTyping/${uid}`
    );
    await set(typingRef, isTyping);
    onDisconnect(typingRef).remove();
  };

  const injectTextDeltaWithAuthor = async (
    delta: string,
    position: number,
    authorId: string
  ) => {
    if (!roomCode || !delta) return;
    await injectTextDelta(delta, position);
    const wordId = `${Date.now()}`;
    const wordRef = doc(
      db,
      `rooms/${roomCode.toUpperCase()}/scoringPayload`,
      wordId
    );
    await setDoc(wordRef, {
      word: delta.trim(),
      authorId: authorId,
      timestamp: Date.now(),
    });
  };

  return {
    currentText,
    activeCursors,
    isTypingMap,
    injectTextDelta,
    injectTextDeltaWithAuthor,
    updateCursor,
    setTypingStatus,
  };
}