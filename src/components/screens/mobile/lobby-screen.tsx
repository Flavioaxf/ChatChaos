"use client";

import { useState } from "react";
import type { Screen } from "@/src/app/page";

interface LobbyScreenProps {
  onNavigate: (screen: Screen) => void;
  // Nova prop para enviar o nome para o arquivo principal
  onSetPlayerName: (name: string) => void; 
}

export function LobbyScreen({ onNavigate, onSetPlayerName }: LobbyScreenProps) {
  // Estado local para capturar o que está sendo digitado
  const [localName, setLocalName] = useState("");

  const handleEnterRoom = () => {
    // Se o usuário não digitar nada, colocamos um nome padrão
    const finalName = localName.trim() !== "" ? localName : "Anônimo";
    onSetPlayerName(finalName);
    onNavigate("theme-voting");
  };

  return (
    <div className="min-h-dvh flex flex-col p-6 sm:p-8 max-w-md mx-auto w-full justify-center">
      {/* Logo */}
      <div className="mb-12 text-center mt-auto sm:mt-0">
        <h1 className="font-display text-5xl sm:text-6xl tracking-tight">
          Chat<span className="text-muted">_</span>
          <span className="text-accent">Caos</span>
        </h1>
        <p className="font-display text-muted text-sm sm:text-base mt-2">
          // jogo de texto coletivo sem delete
        </p>
      </div>

      {/* Form / Inputs */}
      <div className="space-y-5 mb-8">
        <div>
          <label className="font-display text-muted text-sm uppercase tracking-wider mb-2 block">
            Seu Apelido_
          </label>
          <input
            type="text"
            placeholder="NOME DO JOGADOR"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            className="w-full bg-surface border border-border text-ink font-body p-4 rounded-sm focus:outline-none focus:border-accent focus:bg-[rgba(255,107,53,0.12)] transition-colors placeholder:text-muted"
          />
        </div>
        
        <div>
          <label className="font-display text-muted text-sm uppercase tracking-wider mb-2 block">
            Código da Sala_
          </label>
          <input
            type="text"
            placeholder="EX: XKTZ"
            maxLength={4}
            className="w-full bg-surface border border-border text-ink font-body p-4 rounded-sm focus:outline-none focus:border-accent focus:bg-[rgba(255,107,53,0.12)] transition-colors placeholder:text-muted uppercase text-center tracking-widest"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto sm:mt-0 space-y-6">
        <button
          onClick={handleEnterRoom}
          className="btn-primary w-full text-lg py-4"
        >
          ENTRAR NA SALA
        </button>
      </div>
    </div>
  );
}