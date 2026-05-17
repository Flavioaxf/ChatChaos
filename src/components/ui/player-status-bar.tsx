"use client";

import { useState, useEffect } from "react";
import type { Role } from "@/src/app/page";

interface PlayerStatusBarProps {
  playerName: string;
  role?: Role | null;
  isTyping?: boolean; // Nova propriedade para avisar se está digitando
}

export function PlayerStatusBar({ playerName, role, isTyping = false }: PlayerStatusBarProps) {
  const [isMouthOpen, setIsMouthOpen] = useState(false);

  // Efeito que controla a animação da boca
  useEffect(() => {
    // Se não estiver digitando, garante que a boca fique fechada e para a animação
    if (!isTyping) {
      setIsMouthOpen(false);
      return;
    }

    // Se estiver digitando, alterna o estado da boca a cada 150ms
    const interval = setInterval(() => {
      setIsMouthOpen((prev) => !prev);
    }, 150);

    // Limpa o intervalo quando parar de digitar
    return () => clearInterval(interval);
  }, [isTyping]);

  // Define o rostinho ASCII com a boca dinâmica
  const getAvatar = () => {
    const mouth = isMouthOpen ? "O" : "_"; // "O" para aberto, "_" para fechado

    switch (role) {
      case "IRRITADO": return `[ >${isMouthOpen ? "O" : "_"}< ]`; 
      case "HACKEADO": return `[ 0${mouth}1 ]`; 
      case "BEBADO":   return `[ @${mouth}@ ]`; 
      case "MANDARIM": return `[ +${mouth}+ ]`; 
      default:         return `[ -${mouth}- ]`; 
    }
  };

  return (
    <div className="w-full flex items-center justify-between border-b border-border pb-2 mb-4">
      <div className="flex items-center gap-2">
        <span className="font-display text-accent text-xl">
          {getAvatar()}
        </span>
        <span className="font-display text-ink text-lg tracking-wider uppercase truncate max-w-[120px]">
          {playerName}
        </span>
      </div>
      
      <div className="font-display text-muted text-xs uppercase tracking-widest">
        {role ? `PAPEL: ${role}_` : "AGUARDANDO PAPEL_"}
      </div>
    </div>
  );
}