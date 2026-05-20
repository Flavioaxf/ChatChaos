"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Screen, Role } from "@/src/app/page";
import { PlayerStatusBar } from "../../ui/player-status-bar";

interface GameScreenProps {
  onNavigate: (screen: Screen) => void;
  role: Role;
  theme: string;
  playerName: string;
}

const playerColors = {
  you: "#FF6B35",
  player2: "#1C1C1C",
  player3: "#888888",
  player4: "#C8381E",
};

const roleLabels: Record<Role, string> = {
  IRRITADO: "CAPS ATIVO",
  HACKEADO: "BINARIO ATIVO",
  MANDARIM: "TRADUCAO ATIVA",
  BEBADO: "EMBARALHA ATIVO",
};

const mandarimWords: Record<string, string> = {
  oi: "你好",
  ola: "你好",
  obrigado: "谢谢",
  obrigada: "谢谢",
  sim: "是",
  nao: "不",
  bom: "好",
  trabalho: "工作",
  chefe: "老板",
  grupo: "群",
  empresa: "公司",
  tarde: "晚",
  cedo: "早",
  ajuda: "帮助",
  por: "为",
  favor: "请",
};

// Initial shared text simulation
const initialSharedText = [
  { text: "Oi chefe, claro que ", color: playerColors.player2 },
  { text: "NAO CONSIGO ", color: playerColors.you },
  { text: "ajudar, ta bom pra ti ", color: playerColors.player3 },
  { text: "TRABALHAR ATE ", color: playerColors.you },
  { text: "meia noite ", color: playerColors.player4 },
  { text: "MAS A GENTE", color: playerColors.you },
];

export function GameScreen({ onNavigate, role, theme, playerName }: GameScreenProps) {
  const [timeLeft, setTimeLeft] = useState(45);
  const [inputValue, setInputValue] = useState("");
  const [sharedText, setSharedText] = useState(initialSharedText);
  const [typingPlayers, setTypingPlayers] = useState(["Ana", "Carol"]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onNavigate("word-voting");
    }
  }, [timeLeft, onNavigate]);

  // Simulate other players typing
  useEffect(() => {
    const interval = setInterval(() => {
      const players = ["Ana", "Bruno", "Carol", "Diego"];
      const randomPlayers = players
        .filter(() => Math.random() > 0.5)
        .slice(0, 2);
      setTypingPlayers(randomPlayers);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const applyRoleMechanic = useCallback(
    (text: string): string => {
      if (!role) return text;
      switch (role) {
        case "IRRITADO":
          return text.toUpperCase();
        case "HACKEADO":
          return text
            .split("")
            .map((char) => {
              if (Math.random() < 0.28 && char !== " ") {
                return char + (Math.random() > 0.5 ? "0" : "1");
              }
              return char;
            })
            .join("");
        case "BEBADO":
          const swaps: Record<string, string> = {
            a: "4",
            e: "3",
            o: "0",
            s: "5",
            t: "7",
          };
          return text
            .split("")
            .map((char) => {
              if (Math.random() < 0.18 && swaps[char.toLowerCase()]) {
                return swaps[char.toLowerCase()];
              }
              if (Math.random() < 0.1 && char !== " ") {
                return char + " ";
              }
              return char;
            })
            .join("");
        case "MANDARIM":
          // Applied on send, not on input
          return text;
        default:
          return text;
      }
    },
    [role]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Animação de digitação (abre a boca)
    setIsTyping(true);
    
    // Limpa o timeout anterior se houver
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Define um timeout para fechar a boca quando parar de digitar (400ms)
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 400);

    if (role !== "MANDARIM") {
      setInputValue(applyRoleMechanic(newValue));
    } else {
      setInputValue(newValue);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    let textToSend = inputValue;

    // Apply Mandarim translation on send
    if (role === "MANDARIM") {
      textToSend = inputValue
        .split(" ")
        .map((word) => {
          const lower = word.toLowerCase();
          return mandarimWords[lower] || word;
        })
        .join(" ");
    }

    setSharedText((prev) => [
      ...prev,
      { text: " " + textToSend, color: playerColors.you },
    ]);
    setInputValue("");
    
    // Garante que a animação pare ao enviar
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
    // Block backspace/delete
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
    }
  };

  // Limpa o timeout ao desmontar o componente
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const isUrgent = timeLeft <= 10;

  return (
    <div className="min-h-dvh flex flex-col bg-background p-4 sm:p-6 max-w-md mx-auto w-full">
      <PlayerStatusBar playerName={playerName} role={role} isTyping={isTyping} />
      
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-border bg-surface flex-shrink-0">
        <div className="flex items-start justify-between gap-3">
          {/* Category & Context */}
          <div className="flex-1 min-w-0">
            <p className="font-display text-muted text-xs uppercase tracking-wider">
              {theme.toUpperCase()}
              <span className="text-muted">_</span>
            </p>
            <p className="font-body text-muted text-xs mt-1 line-clamp-2">
              &quot;Pessoal, preciso de alguem para cobrir o plantao de sabado&quot;
            </p>
          </div>

          {/* Timer */}
          <div
            className={`flex-shrink-0 font-display text-2xl sm:text-3xl tracking-wider transition-colors ${
              isUrgent ? "text-error" : "text-accent"
            } ${isUrgent ? "animate-pulse" : ""}`}
          >
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Role Strip */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="font-display text-muted text-xs">SEU PAPEL</span>
            <span className="font-display text-accent text-sm">{role}_</span>
          </div>
          {role && <span className="badge text-[10px]">{roleLabels[role]}</span>}
        </div>
      </div>

      {/* Section Label */}
      <div className="px-3 sm:px-4 pt-3">
        <p className="font-display text-muted text-xs uppercase tracking-wider">
          TEXTO COMPARTILHADO - TODOS EDITAM AO MESMO TEMPO
        </p>
      </div>

      {/* Shared Text Field */}
      <div className="flex-1 p-3 sm:p-4 min-h-0 overflow-hidden">
        <div className="h-full card p-3 sm:p-4 overflow-auto">
          <p className="font-body text-base sm:text-lg leading-relaxed">
            {sharedText.map((segment, index) => (
              <span key={index} style={{ color: segment.color }}>
                {segment.text}
              </span>
            ))}
            <span className="cursor-blink inline-block w-2 h-5 bg-ink ml-0.5 align-middle" />
          </p>
        </div>
      </div>

      {/* Typing Indicators */}
      {typingPlayers.length > 0 && (
        <div className="px-3 sm:px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {typingPlayers.map((player) => (
              <span
                key={player}
                className="font-display text-muted text-xs bg-surface px-2 py-1 rounded"
              >
                {player} digitando...
              </span>
            ))}
          </div>
        </div>
      )}

      {/* No Delete Warning */}
      <div className="px-3 sm:px-4 pb-3">
        <div className="bg-[rgba(200,56,30,0.1)] border border-error rounded-lg px-3 py-2 text-center">
          <span className="font-display text-error text-xs sm:text-sm uppercase tracking-wider">
            SEM DELETE - O QUE FOI ESCRITO FICOU
          </span>
        </div>
      </div>

      {/* Input Row */}
      <div className="p-3 sm:p-4 border-t border-border bg-surface flex-shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Digite aqui..."
            className="flex-1 font-body text-sm sm:text-base bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-accent min-w-0"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="btn-primary px-4 py-2 text-sm flex-shrink-0 disabled:opacity-50"
          >
            ENVIAR
          </button>
        </div>
      </div>
    </div>
  );
}