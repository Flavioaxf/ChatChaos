"use client";

import { useState } from "react";
import type { Screen } from "@/src/app/page";
import { PlayerStatusBar } from "../../ui/player-status-bar";

interface ThemeVotingScreenProps {
  onNavigate: (screen: Screen) => void;
  onSelectTheme: (theme: string) => void;
  playerName: string;
}

const themes = [
  { name: "Grupo da empresa", votes: 3 },
  { name: "Grupo da familia", votes: 1 },
  { name: "Republica", votes: 0 },
  { name: "Numero desconhecido", votes: 0 },
  { name: "Calouro no lab", votes: 1 },
];

export function ThemeVotingScreen({ onNavigate, onSelectTheme, playerName }: ThemeVotingScreenProps) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [votesRemaining, setVotesRemaining] = useState(1);
  const [themeVotes, setThemeVotes] = useState(themes);

  const maxVotes = Math.max(...themeVotes.map((t) => t.votes));
  const leadingTheme = themeVotes.find((t) => t.votes === maxVotes)?.name || themes[0].name;

  const handleVote = (themeName: string) => {
    if (votesRemaining <= 0 && selectedTheme !== themeName) return;

    if (selectedTheme === themeName) {
      setThemeVotes((prev) =>
        prev.map((t) => (t.name === themeName ? { ...t, votes: t.votes - 1 } : t))
      );
      setSelectedTheme(null);
      setVotesRemaining(1);
    } else {
      if (selectedTheme) {
        setThemeVotes((prev) =>
          prev.map((t) => (t.name === selectedTheme ? { ...t, votes: t.votes - 1 } : t))
        );
      }
      setThemeVotes((prev) =>
        prev.map((t) => (t.name === themeName ? { ...t, votes: t.votes + 1 } : t))
      );
      setSelectedTheme(themeName);
      setVotesRemaining(0);
    }
  };

  const handleConfirm = () => {
    onSelectTheme(leadingTheme);
    onNavigate("role");
  };

  return (
    <div className="min-h-dvh flex flex-col p-4 sm:p-6 max-w-md mx-auto w-full">
      <PlayerStatusBar playerName={playerName} role={null} />
      
      {/* Header */}
      <div className="mb-8 mt-4">
        <h1 className="font-display text-3xl sm:text-4xl tracking-tight">
          VOTAR NO TEMA<span className="text-muted">_</span>
        </h1>
        <p className="font-display text-muted text-sm mt-2">
          cada jogador vota no tema da rodada
        </p>
      </div>

      {/* Theme List */}
      <div className="flex-1 space-y-3">
        {themeVotes.map((theme) => {
          const isLeading = theme.votes === maxVotes && maxVotes > 0;
          const isSelected = selectedTheme === theme.name;
          const progressWidth = maxVotes > 0 ? (theme.votes / maxVotes) * 100 : 0;

          return (
            <button
              key={theme.name}
              onClick={() => handleVote(theme.name)}
              className={`w-full text-left p-4 sm:p-5 border rounded-md transition-all ${
                isSelected ? "selected-state" : "bg-surface border-border hover:bg-[rgba(208,206,200,0.2)]"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-body text-base sm:text-lg font-medium">
                  {theme.name}
                </span>
                <span
                  className={`font-display text-xl sm:text-2xl ${
                    isLeading ? "text-accent" : "text-muted"
                  }`}
                >
                  {theme.votes}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Votes Remaining */}
      <div className="my-6">
        <p className="font-display text-muted text-base text-center">
          votos restantes: <span className="text-accent text-lg">{votesRemaining}</span>
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={handleConfirm}
        className="btn-primary w-full text-base sm:text-lg py-4 mt-auto mb-4"
      >
        CONFIRMAR E VER PAPEL
      </button>
    </div>
  );
}