import { Player, ScoringPayload, WordResult, VoteCategory } from '@/types/game';

interface RawVote {
  wordIndex: number;
  category: string;
}

export const calculateScoreEngine = (
  roundNum: 1 | 2,
  finalText: string,
  templateText: string,
  players: Player[],
  wordAuthors: Record<number, string>,
  rawVotes: RawVote[]
): ScoringPayload => {
  const finalWords = finalText.trim().split(/\s+/);
  const templateWords = templateText.trim().split(/\s+/);
  
  const aggregatedVotes: Record<number, VoteCategory[]> = {};
  
  rawVotes.forEach(v => {
    if (!aggregatedVotes[v.wordIndex]) {
      aggregatedVotes[v.wordIndex] = [];
    }
    const existingCategory = aggregatedVotes[v.wordIndex].find(c => c.category === v.category);
    if (existingCategory) {
      existingCategory.count += 1;
    } else {
      aggregatedVotes[v.wordIndex].push({ category: v.category, count: 1 });
    }
  });

  const wordsResult: WordResult[] = [];
  const playerScores: Record<string, number> = {};
  
  players.forEach(p => {
    playerScores[p.id] = p.score;
  });

  finalWords.forEach((word, index) => {
    const isTemplate = index < templateWords.length;
    
    // AQUI ESTÁ A CORREÇÃO CRÍTICA DO TYPESCRIPT:
    let authorId: string | null = null;
    let authorName: string | null = null;
    let totalVotesForWord = 0;
    let pointsAwarded = 0;

    if (!isTemplate && wordAuthors[index]) {
      authorId = wordAuthors[index];
      const authorInfo = players.find(p => p.id === authorId);
      authorName = authorInfo ? authorInfo.name : "Desconhecido";
      
      const cats = aggregatedVotes[index] || [];
      totalVotesForWord = cats.reduce((acc, curr) => acc + curr.count, 0);
      pointsAwarded = totalVotesForWord;
      
      if (authorId && playerScores[authorId] !== undefined) {
        playerScores[authorId] += pointsAwarded;
      }
    }

    wordsResult.push({
      wordIndex: index,
      word: word,
      isTemplate: isTemplate,
      authorId: authorId,
      authorName: authorName,
      voteCount: totalVotesForWord,
      voteCategories: aggregatedVotes[index] || [],
      pointsAwarded: pointsAwarded
    });
  });

  return {
    round: roundNum,
    totalWords: finalWords.length,
    words: wordsResult,
    playerScores: playerScores
  };
};