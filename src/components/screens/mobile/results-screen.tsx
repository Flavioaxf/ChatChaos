"use client";

import type { Screen } from "@/src/app/page";

interface ResultsScreenProps {
  onNavigate: (screen: Screen) => void;
}

const playerResults = [
  {
    rank: 1,
    name: "Ana",
    role: "IRRITADO_",
    mechanic: "caps lock",
    success: true,
    points: 330,
  },
  {
    rank: 2,
    name: "Bruno",
    role: "HACKEADO_",
    mechanic: "binario",
    success: true,
    points: 280,
  },
  {
    rank: 3,
    name: "Carol",
    role: "BEBADO_",
    mechanic: "embaralha",
    success: false,
    points: 150,
  },
  {
    rank: 4,
    name: "Diego",
    role: "MANDARIM_",
    mechanic: "traducao",
    success: true,
    points: 120,
  },
];

const winner = playerResults[0];

export function ResultsScreen({ onNavigate }: ResultsScreenProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-background">
      {/* Winner Banner */}
      <div className="bg-accent p-4 sm:p-6 text-center">
        <p className="font-display text-xs sm:text-sm uppercase tracking-wider text-ink opacity-70">
          CAMPEA DO CAOS
        </p>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink tracking-tight mt-1">
          {winner.name.toUpperCase()}
          <span className="text-background">_</span>
        </h1>
        <p className="font-display text-sm sm:text-base text-ink opacity-70 mt-1">
          {winner.points} pts no total
        </p>
      </div>

      {/* Section Label */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6">
        <p className="font-display text-muted text-xs uppercase tracking-wider">
          PAPEIS REVELADOS
        </p>
      </div>

      {/* Results List */}
      <div className="flex-1 px-4 sm:px-6 py-3 sm:py-4 space-y-2 sm:space-y-3 overflow-auto">
        {playerResults.map((player) => (
          <div
            key={player.rank}
            className="card p-3 sm:p-4 flex items-center gap-3"
          >
            {/* Rank */}
            <span
              className={`font-display text-xl sm:text-2xl w-6 sm:w-8 flex-shrink-0 ${
                player.rank === 1 ? "text-accent" : "text-muted"
              }`}
            >
              {player.rank}
            </span>

            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm sm:text-base font-medium truncate">
                {player.name}
              </p>
              <p className="font-display text-muted text-xs sm:text-sm">
                {player.role} / {player.mechanic}
              </p>
            </div>

            {/* Status Badge */}
            <span
              className={`font-display text-[10px] sm:text-xs uppercase px-2 py-1 rounded flex-shrink-0 ${
                player.success ? "badge-success" : "badge-error"
              }`}
            >
              {player.success ? "CUMPRIU" : "FALHOU"}
            </span>

            {/* Points */}
            <span
              className={`font-display text-lg sm:text-xl flex-shrink-0 ${
                player.points > 0 ? "text-accent" : "text-muted"
              }`}
            >
              {player.points}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="px-4 sm:px-6">
        <div className="divider" />
      </div>

      {/* CTA */}
      <div className="p-4 sm:p-6">
        <button
          onClick={() => onNavigate("lobby")}
          className="btn-primary w-full text-sm sm:text-base"
        >
          PROXIMA RODADA
        </button>
      </div>
    </div>
  );
}
