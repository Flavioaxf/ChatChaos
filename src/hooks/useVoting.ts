import { useState } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface RawVote {
  wordIndex: number;
  category: 'BOM_TROCADILHO' | 'CRIATIVO' | 'CAOTICO' | 'CRITICO' | 'INESPERADO';
}

export const useVoting = (roomCode: string, uid: string) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [votingError, setVotingError] = useState<string | null>(null);

  const submitVotes = async (votes: RawVote[]) => {
    if (votes.length !== 7) {
      setVotingError("É obrigatório distribuir exatamente 7 votos.");
      return;
    }
    
    setIsSubmitting(true);
    setVotingError(null);
    
    try {
      const voteDocRef = doc(db, `rooms/${roomCode}/votes`, uid);
      const voteSnap = await getDoc(voteDocRef);
      
      if (voteSnap.exists()) {
        setHasVoted(true);
        setIsSubmitting(false);
        return; // Retorno antecipado garante a proteção contra sobreposições intencionais
      }

      await setDoc(voteDocRef, {
        voterId: uid,
        submittedAt: new Date().toISOString(),
        votes: votes
      });
      
      setHasVoted(true);
    } catch (error) {
      console.error("Falha ao registrar votos no Firestore:", error);
      setVotingError("Erro de conexão ao enviar os votos. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitVotes, isSubmitting, hasVoted, votingError };
};