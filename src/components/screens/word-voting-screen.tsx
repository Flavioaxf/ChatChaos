"use client";

import { useState } from "react";
import type { Screen } from "@/src/app/page";

interface WordVotingScreenProps {
  onNavigate: (screen: Screen) => void;
}

const textWords = [
  { id: 1, text: "Oi", votes: 0 },
  { id: 2, text: "chefe,", votes: 1 },
  { id: 3, text: "claro", votes: 0 },
  { id: 4, text: "que", votes: 0 },
  { id: 5, text: "NAO", votes: 3 },
  { id: 6, text: "CONSIGO", votes: 4 },
  { id: 7, text: "ajudar,", votes: 0 },
  { id: 8, text: "ta", votes: 0 },
  { id: 9, text: "bom", votes: 0 },
  { id: 10, text: "pra", votes: 0 },
  { id: 11, text: "ti", votes: 0 },
  { id: 12, text: "TRABALHAR", votes: 5 },
  { id: 13, text: "ATE", votes: 2 },
  { id: 14, text: "meia", votes: 0 },
  { id: 15, text: "noite", votes: 1 },
  { id: 16, text: "MAS", votes: 2 },
  { id: 17, text: "A", votes: 0 },
  { id: 18, text: "GENTE", votes: 3 },
  { id: 19, text: "TEM", votes: 1 },
  { id: 20, text: "VIDA!!!", votes: 7 },
];

export function WordVotingScreen({ onNavigate }: WordVotingScreenProps) {
  const [words, setWords] = useState(textWords);
  const [votesRemaining, setVotesRemaining] = useState(7);

  const handleVote = (id: number) => {
    if (votesRemaining <= 0) return;

    setWords((prev) =>
      prev.map((word) =>
        word.id === id ? { ...word, votes: word.votes + 1 } : word
      )
    );
    setVotesRemaining((prev) => prev - 1);
  };

  const getWordStyle = (votes: number) => {
    if (votes >= 5) return "selected-state border-2";
    if (votes >= 3) return "bg-[rgba(255,107,53,0.2)] border border-accent";
    return "bg-surface border border-border";
  };

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 sm:p-6">
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
          HORA DE VOTAR<span className="text-muted">_</span>
        </h1>
        <p className="font-display text-muted text-xs sm:text-sm mt-1">
          toque nas palavras que mais gostou
        </p>
      </div>

      {/* Word Cloud */}
      <div className="flex-1 px-4 sm:px-6 pb-4 overflow-auto">
        <div className="card p-3 sm:p-4">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {words.map((word) => (
              <button
                key={word.id}
                onClick={() => handleVote(word.id)}
                disabled={votesRemaining <= 0}
                className={`
                  relative px-2 sm:px-3 py-1 sm:py-1.5 rounded font-body text-sm sm:text-base
                  transition-all hover:scale-105 active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${getWordStyle(word.votes)}
                `}
              >
                {word.text}

                {/* Vote Badge */}
                {word.votes > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-accent text-background rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs font-display">
                    {word.votes}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Votes Remaining */}
      <div className="px-4 sm:px-6 pb-4">
        <p className="font-display text-muted text-sm text-center mb-4">
          votos restantes: <span className="text-accent">{votesRemaining}</span>
        </p>

        {/* CTA */}
        <button
          onClick={() => onNavigate("results")}
          className="btn-primary w-full text-sm sm:text-base"
        >
          CONFIRMAR VOTOS
        </button>
      </div>
    </div>
  );
}
