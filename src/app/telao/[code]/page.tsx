"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { rtdb } from "@/src/lib/firebase";
import { ref, set } from "firebase/database";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";


// Imports com caminhos relativos
import { useSharedText } from "../../../hooks/useSharedText";
import { useGameFlow } from "../../../hooks/useGameFlow";
import TelaoLobbyScreen from "../../../components/screens/telao/telao-lobby-screen";
import TelaoContextScreen from "../../../components/screens/telao/telao-context-screen";
import TelaoMatchScreen from "../../../components/screens/telao/telao-match-screen";
import TelaoResultsScreen from "../../../components/screens/telao/telao-results-screen";

type GameState = "LOBBY" | "CONTEXT_REVEAL" | "TYPING_ROUND_1" | "RESULTS";

export default function TelaoJogoPage() {
  const params = useParams();
  const roomCode = params.code as string;
  
  const {
    gameState,
    roomData,
    players,
    hostStartThemeVoting,
    hostResolveThemeAndStartMatch,
  } = useGameFlow(roomCode);

  // 2. CORREÇÃO: O hook fica AQUI DENTRO, onde o 'roomCode' existe!
  const { currentText, activeCursors, isTypingMap } = useSharedText(
    roomCode,
    "HOST",
  );
  
  const cursoresSimulados = [
    {
      playerId: "1",
      playerName: "FLAVIO_AXF",
      color: "#FF6B35",
      avatar: "(>_<)",
    },
    {
      playerId: "2",
      playerName: "DUPLA_BACK",
      color: "#4A90E2",
      avatar: "(O_O)",
    },
  ];

  if (!gameState) return <div className="h-screen w-screen bg-[#1C1C1C]" />;
  return (
    <div className="relative min-h-screen font-sans">
      {/* ANIMAÇÃO DE ENTRADA DO LOBBY */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes revealLobby {
          0%, 20% { opacity: 1; }
          100% { opacity: 0; visibility: hidden; }
        }
        .animate-reveal { animation: revealLobby 1.2s ease-out forwards; }
      `,
        }}
      />
      <div className="fixed inset-0 z-[9999] bg-[#1C1C1C] animate-reveal pointer-events-none flex items-center justify-center">
        <span className="font-mono text-[#FF6B35] text-2xl tracking-widest animate-pulse">
          LOBBY_MAINFRAME_ONLINE_
        </span>
      </div>

      {/* 1. TELA DE LOBBY */}
      {/* O Firebase comanda qual fase renderizar usando as strings do SRS */}
      {(gameState === "LOBBY" || gameState === "THEME_VOTING") && (
        <TelaoLobbyScreen
          roomCode={roomCode}
          players={players} // <--- DADOS REAIS: Avatares vão surgir ao vivo!
          onStartGame={() => {
            // O Host clica em Iniciar, muda o estado da Nuvem, os mobiles libertam-se!
            hostStartThemeVoting();

            // SIMULAÇÃO TEMPORÁRIA: Para testar nesta iteração, 3 segundos após votação, força o sorteio.
            // (Na próxima iteração ligaremos isso ao contador real de votos)
            setTimeout(() => {
              hostResolveThemeAndStartMatch(
                "SEGURANÇA DA INFORMAÇÃO",
                "TENTATIVA DE INVASÃO REGISTRADA PELO FIREWALL. POR FAVOR EXPLIQUE...",
              );
            }, 3000);
          }}
        />
      )}

      {/* 2. TELA DE CONTEXTO E SINCRONIZAÇÃO */}
      {gameState === "CONTEXT_REVEAL" && (
        <TelaoContextScreen
          theme={roomData?.theme}
          contextText={roomData?.contextText}
          players={players}
          onSequenceComplete={async () => {
            // 1. O Host planta o template inicial no Motor de Tempo Real!
            await set(
              ref(rtdb, `rooms/${roomCode}/liveData/currentText`),
              roomData.contextText,
            );
            // 2. O Host dá autorização para a guerra começar!
            await updateDoc(doc(db, "rooms", roomCode), {
              gameState: "TYPING_ROUND_1",
            });
          }}
        />
      )}

      {/* 3. TELA DE PARTIDA */}
      {gameState === "TYPING_ROUND_1" && (
        <TelaoMatchScreen
          currentRound={1}
          activeTeam={roomData?.activeTeam || "TIME_A"}
          theme={roomData?.theme || ""}
          contextText={roomData?.contextText}
          currentText={currentText || roomData?.contextText || ""} // Texto ganha vida!
          timeLeft={30}
          activeCursors={activeCursors} // Cursores ganham vida!
          isTypingMap={isTypingMap} // Animação ganha vida!
        />
      )}

      {/* 4. TELA DE RESULTADOS */}
      {gameState === "RESULTS" && (
        <TelaoResultsScreen
          // CORREÇÃO: Usar a variável 'players' real vinda do useGameFlow
          rankings={players} 
          onNewGame={() => console.log("Reinício de partida será gerido pelo Firebase na Iteração 6")}
        />
      )}

    </div>
  );
}
