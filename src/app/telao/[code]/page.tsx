"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { rtdb } from "@/src/lib/firebase";
import { ref, set } from "firebase/database";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

import { useSharedText } from "../../../hooks/useSharedText";
import { useGameFlow } from "../../../hooks/useGameFlow";
import TelaoLobbyScreen from "../../../components/screens/telao/telao-lobby-screen";
import TelaoContextScreen from "../../../components/screens/telao/telao-context-screen";
import TelaoMatchScreen from "../../../components/screens/telao/telao-match-screen";
import TelaoResultsScreen from "../../../components/screens/telao/telao-results-screen";

const TEMAS_DISPONIVEIS = ["CIBERSEGURANÇA NA UERN", "GESTÃO E PROTEÇÃO ANIMAL"];

const CONTEXTOS_POR_TEMA: Record<string, string[]> = {
  "CIBERSEGURANÇA NA UERN": [
    "O sistema de matrículas do SIGAA sofreu uma tentativa de invasão na madrugada. Modifique o relatório antes que o reitor descubra...",
    "As catracas digitais do campus começaram a liberar a entrada de animais de forma aleatória. Reescreva o protocolo de contenção imediatamente!",
    "Os computadores do laboratório de informática foram infectados por um vírus que digita sozinho. Intervenha no terminal antes do blackout total."
  ],
  "GESTÃO E PROTEÇÃO ANIMAL": [
    "Um novo grupo de protetores voluntários precisa mapear os pontos de alimentação do campus. Atualize a ata de planejamento com urgência.",
    "O banco de dados do projeto de triagem e vacinação animal apresentou inconsistência nos registros. Corrija o relatório de casos.",
    "Moradores de rua deixaram novos animais no campus e o CampusPet precisa registrar a entrada sem estourar o orçamento. Redija o plano."
  ]
};

const RESPOSTAS_INICIAIS: Record<string, string> = {
  "CIBERSEGURANÇA NA UERN": "Prezado reitor, o SIGAA caiu porque cliquei em um link de lanche gratis no RU e agora tem um urubu digital travando a minha tela...",
  "GESTÃO E PROTEÇÃO ANIMAL": "Atenção CampusPet, os cachorros dominaram a guarita do bloco de computacao, confiscaram os crachas e exigem saches de carne imediatamente..."
};

export default function TelaoJogoPage() {
  const params = useParams();
  const roomCode = params.code as string;
  
  const {
    gameState,
    roomData,
    players,
    hostStartThemeVoting,
    hostStartTyping,
    hostLockTyping,
  } = useGameFlow(roomCode);

  const { currentText, activeCursors, isTypingMap } = useSharedText(roomCode, "HOST");

  const [currentRound, setCurrentRound] = useState(1);
  const [activeTeam, setActiveTeam] = useState("TIME_A");
  const [sincronizedPlayers, setSincronizedPlayers] = useState<any[]>([]);

  useEffect(() => {
    if (!players || players.length === 0) return;
    
    if (sincronizedPlayers.length === players.length && sincronizedPlayers.every(p => p.team !== undefined)) {
      return;
    }

    const mapped = players.map((p, index) => ({
      ...p,
      team: index % 2 === 0 ? "TIME_A" : "TIME_B"
    }));
    
    setSincronizedPlayers(mapped);

    mapped.forEach(async (p) => {
      try {
        await set(ref(rtdb, `rooms/${roomCode}/liveData/players/${p.id}/team`), p.team);
      } catch (e) {
        console.error("Erro ao salvar time no Realtime Database:", e);
      }
    });
  }, [players, roomCode, sincronizedPlayers.length]);

  const apurarEAvancarTema = React.useCallback(async () => {
    try {
      const contagem: Record<string, number> = {};
      TEMAS_DISPONIVEIS.forEach(t => (contagem[t] = 0));

      let totalVotos = 0;
      
      players.forEach(p => {
        if (p.votedTheme && TEMAS_DISPONIVEIS.includes(p.votedTheme)) {
          contagem[p.votedTheme] = (contagem[p.votedTheme] || 0) + 1;
          totalVotos++;
        }
      });

      let temaVencedor = "";

      if (totalVotos === 0) {
        temaVencedor = TEMAS_DISPONIVEIS[Math.floor(Math.random() * TEMAS_DISPONIVEIS.length)];
      } else {
        const maxVotos = Math.max(...Object.values(contagem));
        const maisVotados = Object.keys(contagem).filter(tema => contagem[tema] === maxVotos);

        if (maisVotados.length > 1) {
          temaVencedor = maisVotados[Math.floor(Math.random() * maisVotados.length)];
        } else {
          temaVencedor = maisVotados[0];
        }
      }

      const contextosPossiveis = CONTEXTOS_POR_TEMA[temaVencedor] || CONTEXTOS_POR_TEMA["CIBERSEGURANÇA NA UERN"];
      const contextoSorteado = contextosPossiveis[Math.floor(Math.random() * contextosPossiveis.length)];

      const roomRef = doc(db, "rooms", roomCode);
      await updateDoc(roomRef, {
        theme: temaVencedor,
        contextText: contextoSorteado,
        gameState: "CONTEXT_REVEAL"
      });

    } catch (error) {
      console.error("Erro ao apurar votação:", error);
    }
  }, [players, roomCode]);

  useEffect(() => {
    if (gameState === "THEME_VOTING" && players.length > 0) {
      const todosVotaram = players.every(p => p.votedTheme && p.votedTheme !== "");
      if (todosVotaram) {
        apurarEAvancarTema();
      }
    }
  }, [players, gameState, apurarEAvancarTema]);

  const handleNextRoundOrEnd = async () => {
  if (currentRound === 1) {
    setCurrentRound(2);
    setActiveTeam("TIME_B");

    const temaAtual = roomData?.theme || "CIBERSEGURANÇA NA UERN";
    const rascunhoRound2 = RESPOSTAS_INICIAIS[temaAtual] || "Iniciando rascunho...";

    await set(ref(rtdb, `rooms/${roomCode}/liveData/phase`), "PREPARE");
    await set(ref(rtdb, `rooms/${roomCode}/liveData/currentText`), rascunhoRound2);

    await updateDoc(doc(db, "rooms", roomCode), {
      gameState: "TYPING_ROUND_2",
      activeTeam: "TIME_B",
      currentRound: 2,
      matchPhase: "PREPARE",
    });
  } else {
    await set(ref(rtdb, `rooms/${roomCode}/liveData/phase`), "LOCK");
    await updateDoc(doc(db, "rooms", roomCode), { gameState: "LEADERBOARD" });
  }
};

  if (!gameState) return <div className="h-screen w-screen bg-[#1C1C1C]" />;

  return (
    <div className="relative min-h-screen font-sans bg-[#F7F5F0]">
      <style dangerouslySetInnerHTML={{__html: `@keyframes revealLobby { 0%, 20% { opacity: 1; } 100% { opacity: 0; visibility: hidden; } } .animate-reveal { animation: revealLobby 1.2s ease-out forwards; }`}} />
      
      <div className="fixed inset-0 z-[9999] bg-[#1C1C1C] animate-reveal pointer-events-none flex items-center justify-center">
        <span className="font-mono text-[#FF6B35] text-2xl tracking-widest animate-pulse">LOBBY_MAINFRAME_ONLINE_</span>
      </div>

      {gameState === "LOBBY" && (
        <TelaoLobbyScreen
          roomCode={roomCode}
          players={sincronizedPlayers} 
          onStartGame={hostStartThemeVoting} 
        />
      )}

      {(gameState === "THEME_VOTING" || gameState === "CONTEXT_REVEAL") && (
        <TelaoContextScreen
          theme={roomData?.theme || "AGUARDANDO VOTAÇÃO..."}
          contextText={roomData?.contextText || ""}
          players={sincronizedPlayers}
          currentGameState={gameState}
          onTimeoutVotacao={apurarEAvancarTema}
          onSequenceComplete={async () => {
            try {
              const listaPapeis = ['NORMAL', 'HACKEADO', 'INVERSOR', 'BEBADO', 'MANDARIM'];
              
              const promises = sincronizedPlayers.map(async (player) => {
                const papelSorteado = listaPapeis[Math.floor(Math.random() * listaPapeis.length)];
                return set(ref(rtdb, `rooms/${roomCode}/liveData/players/${player.id}/secretRole`), papelSorteado);
              });

              await Promise.all(promises);

              const temaDefinido = roomData?.theme || "CIBERSEGURANÇA NA UERN";
              const fraseInicialEngracada = RESPOSTAS_INICIAIS[temaDefinido] || "Inicializando terminal...";
              
              await set(ref(rtdb, `rooms/${roomCode}/liveData/currentText`), fraseInicialEngracada);
              await updateDoc(doc(db, "rooms", roomCode), { gameState: "TYPING_ROUND_1" });
            } catch (error) {
              console.error("Erro ao distribuir papéis caóticos no Realtime:", error);
            }
          }}
        />
      )} 
      {/* ☝️ O erro 1 estava aqui! Fechado com )} corretamente agora. */}

      {gameState === "TYPING_ROUND_1" && (
        <TelaoMatchScreen
          currentRound={1}
          activeTeam={activeTeam}
          theme={roomData?.theme || "SISTEMA"}
          contextText={roomData?.contextText}
          currentText={currentText}
          timeLeft={60}
          activeCursors={activeCursors.map(c => {
            const match = sincronizedPlayers.find(p => p.id === c.playerId);
            return { ...c, team: match?.team || "TIME_A" };
          })}
          onRoundComplete={handleNextRoundOrEnd}
          hostStartTyping={hostStartTyping}   
          hostLockTyping={hostLockTyping}     
        />
      )}

      {/* ROUND 2 — time B digita, time A vota */}
      {gameState === "TYPING_ROUND_2" && (
        <TelaoMatchScreen
          currentRound={2}
          activeTeam={roomData?.activeTeam || "TIME_B"}
          theme={roomData?.theme || "SISTEMA"}
          contextText={roomData?.contextText}
          currentText={currentText}
          timeLeft={60}
          activeCursors={activeCursors.map(c => {
            const match = sincronizedPlayers.find(p => p.id === c.playerId);
            return { ...c, team: match?.team || "TIME_B" };
          })}
          onRoundComplete={handleNextRoundOrEnd}
          hostStartTyping={hostStartTyping}
          hostLockTyping={hostLockTyping}
        />
      )} 
      {/* ☝️ O erro 2 estava aqui! Fechado com )} corretamente agora. */}

      {gameState === "RESULTS" && (
        <TelaoResultsScreen
          rankings={sincronizedPlayers} 
          onNewGame={async () => {
            setCurrentRound(1);
            setActiveTeam("TIME_A");
            await updateDoc(doc(db, "rooms", roomCode), { gameState: "LOBBY", contextText: "", theme: "" });
          }}
        />
      )}
    </div>
  );
}