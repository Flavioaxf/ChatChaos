"use client";
import React, { useState, useEffect, useRef } from "react";
import { useVotingLock } from "@/src/hooks/useVotingLock";
import { useAuth } from "@/src/hooks/useAuth";
import { useRoom } from "@/src/hooks/useRoom";
import { useSharedText } from "@/src/hooks/useSharedText";
import { applySecretRole } from "@/src/lib/secretRoles";
import { useGameFlow } from "@/src/hooks/useGameFlow";
import { getFirestore, doc, updateDoc } from "firebase/firestore"
import { db } from "@/src/lib/firebase";
 
import { LobbyScreen } from "@/src/components/screens/mobile/lobby-screen";
import { ThemeVotingScreen } from "@/src/components/screens/mobile/theme-voting-screen";
import { RoleScreen } from "@/src/components/screens/mobile/role-screen";
import { GameScreen } from "@/src/components/screens/mobile/game-screen";
import { VotingScreen } from "@/src/components/screens/mobile/voting-screen";
import { ResultsScreen } from "@/src/components/screens/mobile/results-screen";
import { WaitingScreen } from "@/src/components/screens/mobile/waiting-screen";
 
type MobilePhase =
  | "LOBBY"
  | "WAITING"
  | "THEME_VOTING"
  | "ROLE_REVEAL"
  | "TYPING"
  | "WORD_VOTING"
  | "RESULTS";
 
type GlobalEffect = "NONE" | "BLACKOUT" | "RED_CHAOS";
 
// Mapeamento completo de gameState do Firebase -> fase local do mobile
// Centralizado aqui para não ter mapeamentos espalhados
const GAME_STATE_TO_PHASE: Record<string, MobilePhase> = {
  THEME_VOTING: "THEME_VOTING",
  CONTEXT_REVEAL: "ROLE_REVEAL",
  TYPING_ROUND_1: "TYPING",
  TTS_ROUND_1: "TYPING",       // Durante o TTS, mobile fica na tela de typing (bloqueado)
  VOTING_ROUND_1: "WORD_VOTING",
  SCORING_REVEAL_1: "WORD_VOTING",
  TYPING_ROUND_2: "TYPING",
  TTS_ROUND_2: "TYPING",
  VOTING_ROUND_2: "WORD_VOTING",
  SCORING_REVEAL_2: "WORD_VOTING",
  LEADERBOARD: "RESULTS",
};
 
export default function MobileAppController() {
  const [currentPhase, setCurrentPhase] = useState<MobilePhase>("LOBBY");
  const [globalEffect, setGlobalEffect] = useState<GlobalEffect>("NONE");
  const [systemError, setSystemError] = useState("");
 
  const [player, setPlayer] = useState({
    name: "",
    avatar: "",
    pin: "",
  });
 
  // CORREÇÃO ESTRUTURAL: portão que controla quando o Firebase
  // pode começar a ditar a fase do mobile.
  // false = jogador ainda não entrou, Firebase ignorado para fase
  // true  = jogador confirmado, Firebase controla a fase
  const [hasJoined, setHasJoined] = useState(false);
 
  const { user, loading: authLoading } = useAuth();
  const { joinRoom } = useRoom();
 
  // useGameFlow só começa a ouvir o Firebase quando pin é não-nulo
  // Enquanto pin é "" (antes do joinRoom), roomCode é null e nenhum listener é criado
  const {
    gameState,
    roomData,
    players: roomPlayers,
  } = useGameFlow(hasJoined ? player.pin : null);
 
  const myData = roomPlayers.find((p) => p.id === user?.uid);
 
  const { injectTextDelta, updateCursor, setTypingStatus } = useSharedText(
    hasJoined ? player.pin : null,
    user?.uid || null,
  );
 
  const [lastSentLength, setLastSentLength] = useState(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isAudioFinished } = useVotingLock(hasJoined ? player.pin : null);
 
  // CORREÇÃO: useEffect de sincronia com Firebase
  // Só executa quando hasJoined=true, garantindo que o Firebase
  // nunca sobrescreve a fase enquanto o jogador ainda está no lobby
  useEffect(() => {
    if (!hasJoined) return;
    if (!gameState) return;
 
    const targetPhase = GAME_STATE_TO_PHASE[gameState];
    if (targetPhase) {
      setCurrentPhase(targetPhase);
    }
 
    if (
      (gameState === "TYPING_ROUND_1" || gameState === "TYPING_ROUND_2") &&
      roomData?.contextText
    ) {
      setLastSentLength(roomData.contextText.length);
    }
  }, [gameState, roomData?.contextText, hasJoined]);
 
  // useEffect de vibração — mantido isolado
  useEffect(() => {
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
            systemError={systemError}
            onJoinRoom={async (pin, name, avatar) => {
              setSystemError("");
 
              // Aguarda o Auth estar pronto antes de tentar entrar
              if (authLoading) {
                setSystemError("SISTEMA INICIALIZANDO: AGUARDE E TENTE NOVAMENTE.");
                return;
              }
 
              if (!user) {
                setSystemError("SISTEMA OFFLINE: AUTENTICAÇÃO PENDENTE. TENTE NOVAMENTE.");
                return;
              }
 
              try {
                await joinRoom(pin, user.uid, { name, avatar });
 
                // Atualiza o estado local do jogador
                setPlayer({ pin, name, avatar });
 
                // CORREÇÃO: avança a fase localmente ANTES de ligar o Firebase
                // Isso garante que o mobile vai para THEME_VOTING imediatamente
                setCurrentPhase("WAITING");
 
                // Só DEPOIS abre o portão do Firebase
                // Assim o useEffect de sincronia não pode reverter para LOBBY
                setHasJoined(true);
 
              } catch (error: any) {
                const code = error?.message || "";
 
                if (code === "SALA_NAO_ENCONTRADA") {
                  setSystemError("ACESSO NEGADO: CÓDIGO DE SALA INVÁLIDO.");
                } else if (code === "SALA_JA_INICIOU") {
                  setSystemError("ACESSO NEGADO: PARTIDA JÁ EM ANDAMENTO.");
                } else if (
                  code.includes("CORS") ||
                  code.includes("network") ||
                  code.includes("fetch")
                ) {
                  setSystemError("FALHA DE REDE: VERIFIQUE A CONEXÃO COM O SERVIDOR.");
                } else {
                  setSystemError("ERRO DESCONHECIDO: TENTE NOVAMENTE.");
                }
              }
            }}
          />
        );
 
     case "THEME_VOTING":
        return (
          <ThemeVotingScreen
            playerName={player.name}
            avatar={player.avatar}
            onVoteTheme={async (themeOption) => {
              try {
                // Injeta diretamente o voto na subcoleção de players da sua sala ativa!
                const pRef = doc(db, "rooms", player.pin, "players", user.uid);
                await updateDoc(pRef, { votedTheme: themeOption });
              } catch (e) {
                console.error("Erro ao enviar voto:", e);
              }
            }}
          />
        );
 
      case "ROLE_REVEAL":
        return (
          <RoleScreen
            playerName={player.name}
            avatar={player.avatar}
            theme={roomData?.theme || "CONEXÃO"}
            role={myData?.secretRole || "HACKEADO"}
            onReady={async () => {
              try {
                // Altera o estado do jogador no Firestore para travar e avisar o Telão
                const pRef = doc(db, "rooms", player.pin, "players", user.uid);
                await updateDoc(pRef, { isReadyForMatch: true });
              } catch (e) {
                console.error("Erro ao confirmar prontidão:", e);
              }
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
                const addedChars = newText.slice(-deltaLen);
                const distortedDelta = applySecretRole(
                  addedChars,
                  myData?.secretRole || null,
                );
                injectTextDelta(distortedDelta, cursorPos - deltaLen);
                updateCursor(cursorPos, {
                  playerName: player.name,
                  color: "#FF6B35",
                  avatar: player.avatar,
                });
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
            isLocked={!isAudioFinished}
            onSubmitVotes={() => {
              // Aguarda o Telão avançar o gameState
            }}
          />
        );
 
      case "RESULTS":
        return (
          <ResultsScreen
            playerName={player.name}
            avatar={player.avatar}
            role={myData?.secretRole || "DESCONHECIDO"}
            roleColor="#C8381E"
            points={myData?.score || 0}
            position={
              roomPlayers.findIndex((p) => p.id === user?.uid) + 1
            }
            badge={myData?.score === roomPlayers[0]?.score ? "INFILTRADOR SUPREMO" : "AGENTE"}
            onReturnToLobby={() => {
              setPlayer({ name: "", avatar: "", pin: "" });
              setHasJoined(false);
              setCurrentPhase("LOBBY");
            }}
          />
        );

      case "WAITING":
        return (
          <WaitingScreen
            playerName={player.name}
            avatar={player.avatar}
            roomCode={player.pin}
            playersConnected={roomPlayers.length}
          />
        );
 
      default:
        return <LobbyScreen />;
    }
  };
 
  return (
    <div
      className={`relative w-full min-h-screen bg-[#1C1C1C] overflow-hidden ${
        globalEffect === "RED_CHAOS" ? "animate-shake" : ""
      }`}
    >
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
          @keyframes glitch-line-1 { 0% { top: 10%; } 100% { top: 90%; } }
          .animate-glitch-line-1 { animation: glitch-line-1 2s linear infinite; }
          @keyframes glitch-line-2 { 0% { top: 80%; } 100% { top: 20%; } }
          .animate-glitch-line-2 { animation: glitch-line-2 3s linear infinite; }
        `,
        }}
      />
 
      {/* BARRA DEV TOOLS */}
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
              className={`font-pixel text-xs px-2 py-1 border-2 border-[#1C1C1C] whitespace-nowrap transition-colors ${
                currentPhase === phase
                  ? "bg-[#1C1C1C] text-[#F7F5F0]"
                  : "bg-[#F7F5F0] text-[#1C1C1C]"
              }`}
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
                className={`font-pixel text-xs px-2 py-1 border-2 border-[#1C1C1C] whitespace-nowrap transition-colors ${
                  globalEffect === effect
                    ? "bg-[#1C1C1C] text-[#F7F5F0]"
                    : "bg-[#F7F5F0] text-[#1C1C1C]"
                }`}
              >
                {effect}
              </button>
            ),
          )}
        </div>
      </nav>
 
      <div className="pt-[44px] h-[100dvh]">{renderCurrentScreen()}</div>
 
      {/* EFEITO 1: APAGÃO */}
      {globalEffect === "BLACKOUT" && (
        <div className="absolute inset-0 z-[9990] bg-black flex flex-col items-center justify-center pointer-events-auto overflow-hidden">
          <div className="absolute inset-0 shadow-[inset_0px_0px_100px_rgba(0,0,0,0.9)] z-10"></div>
          <div className="relative w-full h-full opacity-90 mix-blend-screen animate-pulse-fast">
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
            <div className="absolute top-1/4 left-0 w-full h-2 bg-[#C8381E] animate-glitch-line-1 opacity-60"></div>
            <div className="absolute top-3/4 left-0 w-full h-1 bg-[#C8381E] animate-glitch-line-2 opacity-60"></div>
          </div>
        </div>
      )}
 
      {/* EFEITO 2: CAOS VERMELHO */}
      {globalEffect === "RED_CHAOS" && (
        <div className="absolute inset-0 z-[9990] pointer-events-none flex flex-col items-center justify-center bg-[#C8381E]/40 mix-blend-color-burn">
          <div className="absolute inset-0 border-[16px] border-[#C8381E] animate-pulse opacity-80"></div>
          <h1 className="font-pixel text-6xl text-[#C8381E] font-bold uppercase animate-ping">
            CRITICAL
          </h1>
        </div>
      )}
    </div>
  );
}