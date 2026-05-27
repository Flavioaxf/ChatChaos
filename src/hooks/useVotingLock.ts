import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '@/src/lib/firebase';

export function useVotingLock(roomCode: string | null) {
  const [isAudioFinished, setIsAudioFinished] = useState(false);

  useEffect(() => {
    if (!roomCode) return;
    
    // O Telão dita o fim do TTS nesta chave
    const lockRef = ref(rtdb, `rooms/${roomCode.toUpperCase()}/liveData/audioFinished`);
    
    const unsub = onValue(lockRef, (snap) => {
      setIsAudioFinished(snap.val() === true);
    });

    return () => unsub();
  }, [roomCode]);

  return { isAudioFinished };
}