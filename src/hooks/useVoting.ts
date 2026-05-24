import { useState } from 'react';
import { doc, setDoc, getDocs, collection, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { calculateScoreEngine } from '@/utils/scoring-engine';
import { Player, ScoringPayload } from '@/types/game';

interface RawVote {
  wordIndex: number;
  category: string;
}

export const useVoting = (roomCode: string, currentPlayerUid?: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitVotes = async (votes: RawVote[]) => {
    if (!currentPlayerUid) throw new Error("Usuário não autenticado");
    if (votes.length > 7) throw new Error("Limite de 7 votos excedido");

    setIsSubmitting(true);
    try {
      const voteRef = doc(db, `rooms/${roomCode}/votes`, currentPlayerUid);
      await setDoc(voteRef, { 
        votedAt: new Date().toISOString(),
        votes: votes 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateFinalPayload = async (
    roundNum: 1 | 2,
    finalText: string,
    templateText: string,
    players: Player[],
    wordAuthors: Record<number, string>
  ): Promise<ScoringPayload> => {
    
    const votesSnap = await getDocs(collection(db, `rooms/${roomCode}/votes`));
    const rawVotes: RawVote[] = [];
    
    votesSnap.docs.forEach((d: QueryDocumentSnapshot<DocumentData>) => {
      const v = d.data().votes as RawVote[];
      if (v) rawVotes.push(...v);
    });

    return calculateScoreEngine(roundNum, finalText, templateText, players, wordAuthors, rawVotes);
  };

  return { submitVotes, generateFinalPayload, isSubmitting };
};