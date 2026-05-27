"use client";
import React, { useState } from "react";
import { useVotingLock } from "@/src/hooks/useVotingLock";
import { useAuth } from "@/src/hooks/useAuth";
import { useRoom } from "@/src/hooks/useRoom";
import { useSharedText } from "@/src/hooks/useSharedText";
import { applySecretRole } from "@/src/lib/secretRoles";
import { useRef } from "react";
import { useGameFlow } from "@/src/hooks/useGameFlow";

import { LobbyScreen } from "@/src/components/screens/mobile/lobby-screen";
import { ThemeVotingScreen } from "@/src/components/screens/mobile/theme-voting-screen";
import { RoleScreen } from "@/src/components/screens/mobile/role-screen";
import { GameScreen } from "@/src/components/screens/mobile/game-screen";
import { VotingScreen } from "@/src/components/screens/mobile/voting-screen";
import { ResultsScreen } from "@/src/components/screens/mobile/results-screen";

type MobilePhase =
  | "LOBBY"
  | "THEME_VOTING"
  | "ROLE_REVEAL"
  | "TYPING"
  | "WORD_VOTING"
  | "RESULTS";
// Novos estados de efeitos globais
type GlobalEffect = "NONE" | "BLACKOUT" | "RED_CHAOS";

export default function MobileAppController() {
  const [currentPhase, setCurrentPhase] = useState<MobilePhase>("LOBBY");
  const [globalEffect, setGlobalEffect] = useState<GlobalEffect>("NONE");

  const [player, setPlayer] = useState({
    name: "AGENTE_00",
    avatar: "(O_O)",
    pin: "",
  });

  const { user } = useAuth();
  const { joinRoom } = useRoom();

  // 2. CORREÇÃO: Extrair o 'roomData' que faltava!
  const {
    gameState,
    roomData,
    players: roomPlayers,
  } = useGameFlow(player.pin || null);
  const myData = roomPlayers.find((p) => p.id === user?.uid);

  const { injectTextDelta, updateCursor, setTypingStatus } = useSharedText(
    player.pin || null,
    user?.uid || null,
  );
  const [lastSentLength, setLastSentLength] = useState(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isAudioFinished } = useVotingLock(player.pin || null);

  // 3. CORREÇÃO: Um único useEffect bem fechado para sincronia visual
  React.useEffect(() => {
    if (!gameState) return;

    // Atualiza a fase local baseada na nuvem
    const mapping: Record<string, MobilePhase> = {
      LOBBY: "LOBBY",
      THEME_VOTING: "THEME_VOTING",
      CONTEXT_REVEAL: "ROLE_REVEAL",
      TYPING_ROUND_1: "TYPING",
    };

    if (mapping[gameState]) {
      setCurrentPhase(mapping[gameState]);
    }

    // Marca o tamanho inicial do texto para o cálculo do delta
    if (gameState === "TYPING_ROUND_1" && roomData?.contextText) {
      setLastSentLength(roomData.contextText.length);
    }
  }, [gameState, roomData?.contextText]);

  // 4. CORREÇÃO: O useEffect da vibração mantido isolado e limpo
  React.useEffect(() => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      if (globalEffect === "BLACKOUT") {
        navigator.vibrate([100, 30, 100, 30, 300]);
      } else if (globalEffect === "RED_CHAOS") {
        navigator.vibrate([50, 100, 50, 100, 50, 100, 50, 400]);
      } else {
        navigator.vibrate(0);
      }
    }
  }, [globalEffect]);

  const renderCurrentScreen = () => {
    switch (currentPhase) {
      case "LOBBY":
        return (
          <LobbyScreen
            onJoinRoom={async (pin, name, avatar) => {
              if (!user) {
                alert("Aguarde a conexão com o servidor...");
                return;
              }
              try {
                // Tenta entrar na sala via Firebase
                await joinRoom(pin, user.uid, { name, avatar });

                // Só avança o estado visual se o Firebase autorizar
                setPlayer({ pin, name, avatar });
                setCurrentPhase("THEME_VOTING");
              } catch (error: any) {
                alert("ERRO_DE_ACESSO: " + error.message);
              }
            }}
          />
        );
      case "THEME_VOTING":
        return (
          <ThemeVotingScreen
            playerName={player.name}
            avatar={player.avatar}
            onVoteTheme={() =>
              setTimeout(() => setCurrentPhase("ROLE_REVEAL"), 1500)
            }
          />
        );
      case "ROLE_REVEAL":
        return (
          <RoleScreen
            playerName={player.name}
            avatar={player.avatar}
            // DADOS REAIS DO FIREBASE:
            theme="CIBERSEGURANÇA NA UERN"
            role={myData?.secretRole || "DESCONHECIDO"}
            onReady={() => {
              // O jogador diz "OK", mas a tela TYPING só liberta quando o Telão mandar 'TYPING_ROUND_1'
              alert("Aguarde o Telão autorizar a digitação...");
            }}
          />
        );
      case "TYPING":
        return (
          <GameScreen
            playerName={player.name}
            avatar={player.avatar}
            theme={roomData?.theme || "SISTEMA"}
            roleColor={myData?.team === "TIME_A" ? "#06D6A0" : "#4A90E2"}
            initialContext={roomData?.contextText}
            phase="TYPING"
            onCursorMove={(pos) => {
              updateCursor(pos, {
                playerName: player.name,
                color: "#FF6B35",
                avatar: player.avatar,
              });
            }}
            onRealTimeUpdate={(newText, cursorPos) => {
              const deltaLen = newText.length - lastSentLength;
              if (deltaLen > 0) {
                // Extrai apenas as letras novas
                const addedChars = newText.slice(-deltaLen);

                // APLICA O VÍRUS ANTES DE ENVIAR (Lógica em memória)
                const distortedDelta = applySecretRole(
                  addedChars,
                  myData?.secretRole || null,
                );

                // Injeta na Base de Dados na posição exata
                injectTextDelta(distortedDelta, cursorPos - deltaLen);
                updateCursor(cursorPos, {
                  playerName: player.name,
                  color: "#FF6B35",
                  avatar: player.avatar,
                });

                // Animação da Boca (RF-21)
                setTypingStatus(true);
                if (typingTimeoutRef.current)
                  clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(
                  () => setTypingStatus(false),
                  400,
                );

                setLastSentLength(newText.length);
              }
            }}
          />
        );
      case "WORD_VOTING":
        return (
          <VotingScreen
            playerName={player.name}
            avatar={player.avatar}
            // Bloqueia se o audio não terminou (RN-17)
            isLocked={!isAudioFinished}
            onSubmitVotes={() =>
              setTimeout(() => setCurrentPhase("RESULTS"), 2000)
            }
          />
        );
      case "RESULTS":
        return (
          <ResultsScreen
            playerName={player.name}
            avatar={player.avatar}
            role="SISTEMA HACKEADO"
            roleColor="#C8381E"
            points={8450}
            position={1}
            badge="INFILTRADOR SUPREMO"
            onReturnToLobby={() => {
              setPlayer({ name: "", avatar: "", pin: "" });
              setCurrentPhase("LOBBY");
            }}
          />
        );
      default:
        return <LobbyScreen />;
    }
  };

  return (
    <div
      className={`relative w-full min-h-screen bg-[#1C1C1C] overflow-hidden ${globalEffect === "RED_CHAOS" ? "animate-shake" : ""}`}
    >
      {/* Estilos dinâmicos para os efeitos globais */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px) rotate(-1deg); }
          50% { transform: translateX(4px) rotate(1deg); }
          75% { transform: translateX(-4px) rotate(0deg); }
        }
        .animate-shake { animation: shake 0.2s infinite; }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .animate-blink { animation: blink 0.8s infinite; }
        .animate-pulse-fast { animation: blink 0.15s infinite; }

        @keyframes glitch-text {
          0% { transform: translate(0); }
          20% { transform: translate(-4px, 2px); }
          40% { transform: translate(-4px, -2px); }
          60% { transform: translate(4px, 2px); }
          80% { transform: translate(4px, -2px); }
          100% { transform: translate(0); }
        }
        .animate-glitch-text { animation: glitch-text 0.15s infinite; }

        @keyframes glitch-line-1 {
          0% { top: 10%; }
          100% { top: 90%; }
        }
        .animate-glitch-line-1 { animation: glitch-line-1 2s linear infinite; }

        @keyframes glitch-line-2 {
          0% { top: 80%; }
          100% { top: 20%; }
        }
        .animate-glitch-line-2 { animation: glitch-line-2 3s linear infinite; }
      `,
        }}
      />

      {/* BARRA DEV TOOLS PARA TESTAR OS EFEITOS (Com scroll horizontal se não couber) */}
      <nav className="absolute top-0 left-0 w-full bg-[#FF6B35] flex overflow-x-auto gap-2 p-2 z-[9999] border-b-4 border-[#1C1C1C] no-scrollbar">
        <div className="flex gap-2 pr-4 items-center">
          <span className="font-pixel text-[#1C1C1C] font-bold px-2 shrink-0">
            FASES:
          </span>
          {(
            [
              "LOBBY",
              "THEME_VOTING",
              "ROLE_REVEAL",
              "TYPING",
              "WORD_VOTING",
              "RESULTS",
            ] as MobilePhase[]
          ).map((phase) => (
            <button
              key={phase}
              onClick={() => setCurrentPhase(phase)}
              className={`font-pixel text-xs px-2 py-1 border-2 border-[#1C1C1C] whitespace-nowrap transition-colors ${currentPhase === phase ? "bg-[#1C1C1C] text-[#F7F5F0]" : "bg-[#F7F5F0] text-[#1C1C1C]"}`}
            >
              {phase}
            </button>
          ))}
          <span className="font-pixel text-[#1C1C1C] font-bold px-2 border-l-4 border-[#1C1C1C] pl-4 shrink-0">
            EFEITOS:
          </span>
          {(["NONE", "BLACKOUT", "RED_CHAOS"] as GlobalEffect[]).map(
            (effect) => (
              <button
                key={effect}
                onClick={() => setGlobalEffect(effect)}
                className={`font-pixel text-xs px-2 py-1 border-2 border-[#1C1C1C] whitespace-nowrap transition-colors ${globalEffect === effect ? "bg-[#1C1C1C] text-[#F7F5F0]" : "bg-[#F7F5F0] text-[#1C1C1C]"}`}
              >
                {effect}
              </button>
            ),
          )}
        </div>
      </nav>

      {/* RENDERIZAÇÃO DA TELA ATUAL */}
      <div className="pt-[44px] h-[100dvh]">{renderCurrentScreen()}</div>

      {/* =========================================================
          CAMADA DE EFEITOS GLOBAIS (Sobrepõe tudo)
          ========================================================= */}

      {/* EFEITO 1: O APAGÃO (Corrupção Digital Completa e Bloqueio) */}
      {globalEffect === "BLACKOUT" && (
        <div className="absolute inset-0 z-[9990] bg-black flex flex-col items-center justify-center pointer-events-auto overflow-hidden">
          {/* Sombra interna para profundidade */}
          <div className="absolute inset-0 shadow-[inset_0px_0px_100px_rgba(0,0,0,0.9)] z-10"></div>

          {/* Container do Glitch visual */}
          <div className="relative w-full h-full opacity-90 mix-blend-screen animate-pulse-fast">
            {/* Texto de Erro Piscando e Rasgado */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20 w-full">
              <h1 className="font-pixel text-6xl text-[#C8381E] font-bold uppercase tracking-tighter animate-glitch-text">
                SYSTEM
                <br />
                FAULT
              </h1>
              <span className="font-pixel text-[#C8381E] text-2xl animate-blink mt-2 block">
                [ CORRUPTED ]
              </span>
            </div>

            {/* Ruído Estático de Fundo */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMzMzIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-20"></div>

            {/* Linhas de Falha Horizontais piscando */}
            <div className="absolute top-1/4 left-0 w-full h-2 bg-[#C8381E] animate-glitch-line-1 opacity-60"></div>
            <div className="absolute top-3/4 left-0 w-full h-1 bg-[#C8381E] animate-glitch-line-2 opacity-60"></div>
          </div>
        </div>
      )}

      {/* EFEITO 2: CAOS VERMELHO (Tudo fica vermelho, piscando, e tremendo) */}
      {globalEffect === "RED_CHAOS" && (
        <div className="absolute inset-0 z-[9990] pointer-events-none flex flex-col items-center justify-center bg-[#C8381E]/40 mix-blend-color-burn">
          <div className="absolute inset-0 border-[16px] border-[#C8381E] animate-pulse opacity-80"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjQzgzODFFIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-50"></div>
          <h1 className="font-pixel text-6xl text-[#C8381E] font-bold uppercase animate-ping">
            CRITICAL
          </h1>
        </div>
      )}
    </div>
  );
}
