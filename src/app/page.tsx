"use client";
import React, { useState, useEffect, useRef } from "react";
import { useVotingLock } from "@/src/hooks/useVotingLock";
import { useAuth } from "@/src/hooks/useAuth";
import { useRoom } from "@/src/hooks/useRoom";
import { useSharedText } from "@/src/hooks/useSharedText";
import { useGameFlow } from "@/src/hooks/useGameFlow";
import { rtdb } from "@/src/lib/firebase"; 
import { ref, set, onValue } from "firebase/database"; 
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
 
import { LobbyScreen } from "@/src/components/screens/mobile/lobby-screen";
import { ThemeVotingScreen } from "@/src/components/screens/mobile/theme-voting-screen";
import { RoleScreen } from "@/src/components/screens/mobile/role-screen";
import { GameScreen } from "@/src/components/screens/mobile/game-screen";
import { VotingScreen } from "@/src/components/screens/mobile/voting-screen";
import { ResultsScreen } from "@/src/components/screens/mobile/results-screen";
import { WaitingScreen } from "@/src/components/screens/mobile/waiting-screen";
 
type MobilePhase = "LOBBY" | "WAITING" | "THEME_VOTING" | "ROLE_REVEAL" | "TYPING" | "WORD_VOTING" | "RESULTS";
type GlobalEffect = "NONE" | "BLACKOUT" | "RED_CHAOS";
 
const GAME_STATE_TO_PHASE: Record<string, MobilePhase> = {
  THEME_VOTING: "THEME_VOTING",
  CONTEXT_REVEAL: "ROLE_REVEAL",
  TYPING_ROUND_1: "TYPING",
  TTS_ROUND_1: "TYPING",       
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
 
  const [player, setPlayer] = useState({ name: "", avatar: "", pin: "" });
  const [hasJoined, setHasJoined] = useState(false);
  
  const [realtimeTeam, setRealtimeTeam] = useState<string | null>(null);
  const [realtimeRole, setRealtimeRole] = useState<string | null>(null);
  const [telaoSubPhase, setTelaoSubPhase] = useState<string>("PREPARE");
  const [realtimeText, setRealtimeText] = useState<string>(""); 
 
  const { user, loading: authLoading } = useAuth();
  const { joinRoom } = useRoom();
 
  const { gameState, roomData, players: roomPlayers } = useGameFlow(hasJoined ? player.pin : null);
  const myData = roomPlayers.find((p) => p.id === user?.uid);
 
  const { injectTextDelta, updateCursor, setTypingStatus } = useSharedText(
    hasJoined ? player.pin : null,
    user?.uid || null,
  );
 
  const [lastSentLength, setLastSentLength] = useState(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isAudioFinished } = useVotingLock(hasJoined ? player.pin : null);
 
  // Escuta ativa das diretrizes síncronas do Telão
  useEffect(() => {
    if (!hasJoined || !user?.uid || !player.pin) return;

    const liveRef = ref(rtdb, `rooms/${player.pin}/liveData`);
    const unsubscribe = onValue(liveRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.phase) setTelaoSubPhase(data.phase);
        if (data.currentText) setRealtimeText(data.currentText); 
        
        const myNode = data.players?.[user.uid];
        if (myNode) {
          if (myNode.team) setRealtimeTeam(myNode.team);
          if (myNode.secretRole) setRealtimeRole(myNode.secretRole);
        }
      }
    });

    return () => unsubscribe();
  }, [hasJoined, user?.uid, player.pin]);

  // Transição de Fases do Jogo Global
  useEffect(() => {
    if (!hasJoined || !gameState) return;
    const targetPhase = GAME_STATE_TO_PHASE[gameState];
    if (targetPhase) setCurrentPhase(targetPhase);
 
    if ((gameState === "TYPING_ROUND_1" || gameState === "TYPING_ROUND_2") && realtimeText) {
      setLastSentLength(realtimeText.length);
    }
  }, [gameState, realtimeText, hasJoined]);
 
  // Motor de Vibração Haptic Feedback
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      if (globalEffect === "BLACKOUT") navigator.vibrate([100, 30, 100, 30, 300]);
      else if (globalEffect === "RED_CHAOS") navigator.vibrate([50, 100, 50, 100, 50, 100, 50, 400]);
      else navigator.vibrate(0);
    }
  }, [globalEffect]);
 
  const renderCurrentScreen = () => {
    switch (currentPhase) {
      case "LOBBY":
        return (
          <LobbyScreen systemError={systemError} onJoinRoom={async (pin, name, avatar) => {
              setSystemError("");
              if (authLoading) return setSystemError("SISTEMA INICIALIZANDO: AGUARDE E TENTE NOVAMENTE.");
              if (!user) return setSystemError("SISTEMA OFFLINE: AUTENTICAÇÃO PENDENTE. TENTE NOVAMENTE.");
              try {
                await joinRoom(pin, user.uid, { name, avatar });
                setPlayer({ pin, name, avatar });
                setCurrentPhase("WAITING");
                setHasJoined(true);
              } catch (error: any) {
                setSystemError("ACESSO NEGADO: VERIFIQUE O PIN OU A REDE.");
              }
            }} />
        );

      case "THEME_VOTING":
        return (
          <ThemeVotingScreen playerName={player.name} avatar={player.avatar} onVoteTheme={async (themeOption) => {
              try {
                await set(ref(rtdb, `rooms/${player.pin}/liveData/votos/${user.uid}`), themeOption);
                const pRef = doc(db, "rooms", player.pin, "players", user.uid);
                await updateDoc(pRef, { votedTheme: themeOption });
              } catch (e) { console.error("Erro ao enviar voto:", e); }
            }} />
        );

      case "ROLE_REVEAL":
        const papelRealtimeReveal = realtimeRole || myData?.secretRole || "NORMAL";
        return (
          <RoleScreen playerName={player.name} avatar={player.avatar} theme={roomData?.theme || "CONEXÃO"} role={papelRealtimeReveal as any} onReady={async () => {
              try {
                await set(ref(rtdb, `rooms/${player.pin}/liveData/prontos/${user.uid}`), true);
                const pRef = doc(db, "rooms", player.pin, "players", user.uid);
                await updateDoc(pRef, { isReadyForMatch: true });
              } catch (e) { console.error("Erro ao confirmar prontidão:", e); }
            }} />
        );

      case "TYPING":
        const papelRealtimeTyping = realtimeRole || myData?.secretRole || "NORMAL";
        const timeRealtime = realtimeTeam || myData?.team || "TIME_A";
        const rascunhoSincronizado = roomData?.liveData?.currentText || roomData?.contextText || "Carregando Rascunho...";

        if (timeRealtime !== (roomData?.activeTeam || "TIME_A")) {
          return (
            <main className="h-screen w-full bg-[#1C1C1C] flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
              <div className="border-4 border-[#C8381E] p-8 bg-[#0A0A0A] shadow-[8px_8px_0px_#C8381E] rounded-[8px] max-w-xs">
                <h2 className="font-pixel text-[#C8381E] text-3xl uppercase mb-3 animate-pulse">[ CANAL EM LEITURA ]</h2>
                <p className="font-pixel text-[#F7F5F0] text-xl uppercase tracking-wider leading-relaxed">
                  Sua equipe ({timeRealtime}) está em stand-by. Observe o Telão! O time oposto está modificando o rascunho agora.
                </p>
              </div>
            </main>
          );
        }

        return (
          <GameScreen
            playerName={player.name}
            avatar={player.avatar}
            theme={roomData?.theme || "SISTEMA"}
            role={papelRealtimeTyping as any} 
            roleColor={timeRealtime === "TIME_A" ? "#06D6A0" : "#4A90E2"}
            playerTeam={timeRealtime} 
            activeTeam={roomData?.activeTeam || "TIME_A"} 
            initialContext={rascunhoSincronizado} 
            phase={telaoSubPhase === "TYPING" ? "TYPING" : "PREPARE"}
            onCursorMove={(pos) => {
              // Quando seleciona um lugar
              updateCursor(pos, { playerName: player.name, color: timeRealtime === "TIME_A" ? "#06D6A0" : "#4A90E2", avatar: player.avatar, team: timeRealtime });
            }}
            onRealTimeUpdate={(delta, cursorPos) => {
              // Manda só o Delta para a hook transacionar!
              injectTextDelta(delta, cursorPos);
              
              setTypingStatus(true);
              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => setTypingStatus(false), 400);
            }}
          />
        );

      case "WORD_VOTING":
        return <VotingScreen playerName={player.name} avatar={player.avatar} isLocked={!isAudioFinished} onSubmitVotes={() => {}} />;
      
      case "RESULTS":
        return <ResultsScreen playerName={player.name} avatar={player.avatar} role={myData?.secretRole || "DESCONHECIDO"} roleColor="#C8381E" points={myData?.score || 0} position={roomPlayers.findIndex((p) => p.id === user?.uid) + 1} badge={myData?.score === roomPlayers[0]?.score ? "INFILTRADOR SUPREMO" : "AGENTE"} onReturnToLobby={() => { setPlayer({ name: "", avatar: "", pin: "" }); setHasJoined(false); setCurrentPhase("LOBBY"); }} />;
      
      case "WAITING":
        return <WaitingScreen playerName={player.name} avatar={player.avatar} roomCode={player.pin} playersConnected={roomPlayers.length} />;
      
      default:
        return <LobbyScreen />;
    }
  };
 
  return (
    <div className={`relative w-full min-h-screen bg-[#1C1C1C] overflow-hidden ${globalEffect === "RED_CHAOS" ? "animate-shake" : ""}`}>
      <style dangerouslySetInnerHTML={{ __html: `
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
      `}} />
 
      {/* BARRA DEV TOOLS */}
      <nav className="absolute top-0 left-0 w-full bg-[#FF6B35] flex overflow-x-auto gap-2 p-2 z-[9999] border-b-4 border-[#1C1C1C] no-scrollbar">
        <div className="flex gap-2 pr-4 items-center">
          <span className="font-pixel text-[#1C1C1C] font-bold px-2 shrink-0">FASES:</span>
          {([ "LOBBY", "THEME_VOTING", "ROLE_REVEAL", "TYPING", "WORD_VOTING", "RESULTS" ] as MobilePhase[]).map((phase) => (
            <button
              key={phase}
              onClick={() => setCurrentPhase(phase)}
              className={`font-pixel text-xs px-2 py-1 border-2 border-[#1C1C1C] whitespace-nowrap transition-colors ${currentPhase === phase ? "bg-[#1C1C1C] text-[#F7F5F0]" : "bg-[#F7F5F0] text-[#1C1C1C]"}`}
            >
              {phase}
            </button>
          ))}
          <span className="font-pixel text-[#1C1C1C] font-bold px-2 border-l-4 border-[#1C1C1C] pl-4 shrink-0">EFEITOS:</span>
          {(["NONE", "BLACKOUT", "RED_CHAOS"] as GlobalEffect[]).map((effect) => (
            <button
              key={effect}
              onClick={() => setGlobalEffect(effect)}
              className={`font-pixel text-xs px-2 py-1 border-2 border-[#1C1C1C] whitespace-nowrap transition-colors ${globalEffect === effect ? "bg-[#1C1C1C] text-[#F7F5F0]" : "bg-[#F7F5F0] text-[#1C1C1C]"}`}
            >
              {effect}
            </button>
          ))}
        </div>
      </nav>
 
      <div className="pt-[44px] h-[100dvh]">{renderCurrentScreen()}</div>
 
      {/* EFEITOS GLOBAIS */}
      {globalEffect === "BLACKOUT" && (
        <div className="absolute inset-0 z-[9990] bg-black flex flex-col items-center justify-center pointer-events-auto overflow-hidden">
          <div className="absolute inset-0 shadow-[inset_0px_0px_100px_rgba(0,0,0,0.9)] z-10"></div>
          <div className="relative w-full h-full opacity-90 mix-blend-screen animate-pulse-fast">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20 w-full">
              <h1 className="font-pixel text-6xl text-[#C8381E] font-bold uppercase tracking-tighter animate-glitch-text">SYSTEM<br />FAULT</h1>
              <span className="font-pixel text-[#C8381E] text-2xl animate-blink mt-2 block">[ CORRUPTED ]</span>
            </div>
            <div className="absolute top-1/4 left-0 w-full h-2 bg-[#C8381E] animate-glitch-line-1 opacity-60"></div>
            <div className="absolute top-3/4 left-0 w-full h-1 bg-[#C8381E] animate-glitch-line-2 opacity-60"></div>
          </div>
        </div>
      )}
 
      {globalEffect === "RED_CHAOS" && (
        <div className="absolute inset-0 z-[9990] pointer-events-none flex flex-col items-center justify-center bg-[#C8381E]/40 mix-blend-color-burn">
          <div className="absolute inset-0 border-[16px] border-[#C8381E] animate-pulse opacity-80"></div>
          <h1 className="font-pixel text-6xl text-[#C8381E] font-bold uppercase animate-ping">CRITICAL</h1>
        </div>
      )}
    </div>
  );
}