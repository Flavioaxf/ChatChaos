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

export interface Cursor {
  playerId: string;
  playerName: string;
  color: string;
  avatar: string;
  position: number;
}

export function useSharedText(roomCode: string | null, uid: string | null) {
  const [currentText, setCurrentText] = useState("");
  const [activeCursors, setActiveCursors] = useState<Cursor[]>([]);
  const [isTypingMap, setIsTypingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!roomCode) return;
    const codeUpper = roomCode.toUpperCase();

    // 1. Escutar a resposta do terminal (REPLY_)
    const textRef = ref(rtdb, `rooms/${codeUpper}/liveData/currentText`);
    const unsubText = onValue(textRef, (snap) => {
      if (snap.exists()) setCurrentText(snap.val());
    });

    // 2. Escutar a posição dos Cursores dos jogadores
    const cursorsRef = ref(rtdb, `rooms/${codeUpper}/liveData/cursors`);
    const unsubCursors = onValue(cursorsRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        setActiveCursors(
          Object.keys(data).map((key) => ({ playerId: key, ...data[key] })),
        );
      } else {
        setActiveCursors([]);
      }
    });

    // 3. Escutar quem está a digitar (para animar as bocas ASCII)
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

  // Função para os Mobiles Injetarem Texto (Atomic Transaction)
  const injectTextDelta = async (delta: string, position: number) => {
    if (!roomCode || !delta) return;
    const textRef = ref(
      rtdb,
      `rooms/${roomCode.toUpperCase()}/liveData/currentText`,
    );

    // Transaction garante que o texto não é sobrescrito, apenas costurado
    await runTransaction(textRef, (currentVal) => {
      if (currentVal === null) return currentVal;
      const safePos = Math.min(position, currentVal.length);
      return currentVal.slice(0, safePos) + delta + currentVal.slice(safePos);
    });
  };

  const updateCursor = async (position: number, playerInfo: any) => {
    if (!roomCode || !uid) return;
    const cursorRef = ref(
      rtdb,
      `rooms/${roomCode.toUpperCase()}/liveData/cursors/${uid}`,
    );
    await set(cursorRef, { position, ...playerInfo });
    onDisconnect(cursorRef).remove(); // Desaparece se cair a net
  };

  const setTypingStatus = async (isTyping: boolean) => {
    if (!roomCode || !uid) return;
    const typingRef = ref(
      rtdb,
      `rooms/${roomCode.toUpperCase()}/liveData/isTyping/${uid}`,
    );
    await set(typingRef, isTyping);
    onDisconnect(typingRef).remove();
  };

  const injectTextDeltaWithAuthor = async (
    delta: string,
    position: number,
    authorId: string,
  ) => {
    if (!roomCode || !delta) return;

    // 1. Injeção visual no RTDB (O texto que o telão vê)
    await injectTextDelta(delta, position);

    // 2. Persistência de Autoria no Firestore (O 'rastro' para o Scoring)
    // Usamos um ID único baseado no tempo para cada inserção
    const wordId = `${Date.now()}`;
    const wordRef = doc(
      db,
      `rooms/${roomCode.toUpperCase()}/scoringPayload`,
      wordId,
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
    updateCursor,
    setTypingStatus,
  };
}
