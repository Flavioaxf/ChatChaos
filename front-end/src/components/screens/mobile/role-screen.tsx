"use client";

import { useEffect } from "react";
import type { Screen, Role } from "@/src/app/page";
import { PlayerStatusBar } from "../../ui/player-status-bar";

interface RoleScreenProps {
  onNavigate: (screen: Screen) => void;
  selectedRole: Role;
  onSelectRole: (role: Role) => void;
  playerName: string; // Nova prop
}

const roles: {
  id: Role;
  name: string;
  description: string;
  badge: string;
}[] = [
  {
    id: "IRRITADO",
    name: "IRRITADO_",
    description: "Tudo que voce digitar vira CAPS LOCK automaticamente.",
    badge: "CAPS LOCK",
  },
  {
    id: "HACKEADO",
    name: "HACKEADO_",
    description: "0s e 1s inseridos aleatoriamente entre as letras enquanto voce digita.",
    badge: "BINARIO",
  },
  {
    id: "MANDARIM",
    name: "MANDARIM_",
    description: "Palavras enviadas trocadas por equivalentes em chines mandarin.",
    badge: "TRADUCAO",
  },
  {
    id: "BEBADO",
    name: "BEBADO_",
    description: "Letras aleatorias trocadas e espacos extras aparecem ao digitar.",
    badge: "EMBARALHA",
  },
];

export function RoleScreen({ onNavigate, selectedRole, onSelectRole, playerName }: RoleScreenProps) {
  
  useEffect(() => {
    if (!selectedRole) {
      const randomIndex = Math.floor(Math.random() * roles.length);
      onSelectRole(roles[randomIndex].id);
    }
  }, [selectedRole, onSelectRole]);

  const activeRole = roles.find((r) => r.id === selectedRole);

  return (
    <div className="min-h-dvh flex flex-col p-6 sm:p-8 max-w-md mx-auto w-full justify-center">
      
      <PlayerStatusBar playerName={playerName} role={selectedRole} />

      {/* Header Confidencial */}
      <div className="mb-8 mt-auto sm:mt-0 text-center">
        <h1 className="font-display text-3xl sm:text-4xl tracking-tight text-error uppercase">
          Aviso: Confidencial<span className="text-ink cursor-blink">_</span>
        </h1>
        <p className="font-display text-muted text-sm mt-2">
          // sorteado automaticamente - nao mostre a ninguem
        </p>
      </div>

      {/* Card da Missão Sorteada */}
      <div className="flex-1 flex flex-col justify-center mb-8">
        {activeRole ? (
          <div className="card p-6 sm:p-8 border-accent bg-[rgba(255,107,53,0.05)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-accent" />

            <p className="font-display text-muted text-xs uppercase tracking-wider mb-4">
              SUA MISSÃO_
            </p>

            <div className="flex items-start justify-between gap-4 mb-6">
              <h2 className="font-display text-4xl sm:text-5xl text-accent tracking-tight break-all">
                {activeRole.name}
              </h2>
              <span className="badge bg-ink text-accent mt-2 flex-shrink-0">
                {activeRole.badge}
              </span>
            </div>

            <div className="divider my-4 bg-[rgba(208,206,200,0.5)]" />

            <p className="font-body text-lg sm:text-xl text-ink leading-relaxed font-medium">
              {activeRole.description}
            </p>
          </div>
        ) : (
          <div className="flex justify-center items-center h-48 gap-2">
            <span className="loading-dot w-2 h-2 bg-accent rounded-full" />
            <span className="loading-dot w-2 h-2 bg-accent rounded-full" />
            <span className="loading-dot w-2 h-2 bg-accent rounded-full" />
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="mt-auto sm:mt-0 space-y-6 mb-4">
        <button
          onClick={() => onNavigate("game")}
          disabled={!activeRole}
          className="btn-primary w-full text-lg py-4"
        >
          ENTENDIDO - ENTRAR NO JOGO
        </button>
      </div>
    </div>
  );
}