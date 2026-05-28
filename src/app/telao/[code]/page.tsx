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

export default function TelaoJogoPage() {
  const params = useParams();
  const roomCode = params.code as string;
  
  const {
    gameState,
    roomData,
    players,
    hostStartThemeVoting,
  } = useGameFlow(roomCode);

  const { currentText, activeCursors, isTypingMap } = useSharedText(roomCode, "HOST");

  // Função robusta de apuração de votos com critérios de desempate e seleção aleatória
  const apurarEAvancarTema = React.useCallback(async () => {
    try {
      const contagem: Record<string, number> = {};
      TEMAS_DISPONIVEIS.forEach(t => (contagem[t] = 0));

      let totalVotos = 0;
      
      // Contabiliza os votos reais vindos dos jogadores
      players.forEach(p => {
        if (p.votedTheme && TEMAS_DISPONIVEIS.includes(p.votedTheme)) {
          contagem[p.votedTheme] = (contagem[p.votedTheme] || 0) + 1;
          totalVotos++;
        }
      });

      let temaVencedor = "";

      if (totalVotos === 0) {
        // Regra 1: Nenhum tema votado -> Escolhe um aleatoriamente entre todos
        temaVencedor = TEMAS_DISPONIVEIS[Math.floor(Math.random() * TEMAS_DISPONIVEIS.length)];
      } else {
        // Encontra o maior número de votos
        const maxVotos = Math.max(...Object.values(contagem));
        // Filtra quais temas alcançaram esse maior número (para verificar empates)
        const maisVotados = Object.keys(contagem).filter(tema => contagem[tema] === maxVotos);

        if (maisVotados.length > 1) {
          // Regra 2: Caso de empate -> Escolhe aleatoriamente entre os mais votados
          temaVencedor = maisVotados[Math.floor(Math.random() * maisVotados.length)];
        } else {
          // Regra 3: Vitória limpa por maioria de votos
          temaVencedor = maisVotados[0];
        }
      }

      // Sorteia o contexto correspondente ao tema vencedor
      const contextosPossiveis = CONTEXTOS_POR_TEMA[temaVencedor] || CONTEXTOS_POR_TEMA["CIBERSEGURANÇA NA UERN"];
      const contextoSorteado = contextosPossiveis[Math.floor(Math.random() * contextosPossiveis.length)];

      // ATUALIZAÇÃO CRUCIAL NO FIRESTORE: Muda o estado global para destravar o Mobile!
      const roomRef = doc(db, "rooms", roomCode);
      await updateDoc(roomRef, {
        theme: temaVencedor,
        contextText: contextoSorteado,
        gameState: "CONTEXT_REVEAL" // Avança a fase globalmente!
      });

    } catch (error) {
      console.error("Erro ao apurar votação:", error);
    }
  }, [players, roomCode]);

  // Monitora se todos os jogadores já votaram para acelerar o avanço
  useEffect(() => {
    if (gameState === "THEME_VOTING" && players.length > 0) {
      const todosVotaram = players.every(p => p.votedTheme && p.votedTheme !== "");
      if (todosVotaram) {
        apurarEAvancarTema();
      }
    }
  }, [players, gameState, apurarEAvancarTema]);

  if (!gameState) return <div className="h-screen w-screen bg-[#1C1C1C]" />;

  return (
    <div className="relative min-h-screen font-sans bg-[#F7F5F0]">
      <style dangerouslySetInnerHTML={{__html: `@keyframes revealLobby { 0%, 20% { opacity: 1; } 100% { opacity: 0; visibility: hidden; } } .animate-reveal { animation: revealLobby 1.2s ease-out forwards; }`}} />
      
      <div className="fixed inset-0 z-[9999] bg-[#1C1C1C] animate-reveal pointer-events-none flex items-center justify-center">
        <span className="font-mono text-[#FF6B35] text-2xl tracking-widest animate-pulse">LOBBY_MAINFRAME_ONLINE_</span>
      </div>

      {/* 1. TELA DE LOBBY */}
      {gameState === "LOBBY" && (
        <TelaoLobbyScreen
          roomCode={roomCode}
          players={players} 
          onStartGame={hostStartThemeVoting} 
        />
      )}

      {/* 2. TELA DE CONTEXTO / VOTAÇÃO NATIVA */}
      {(gameState === "THEME_VOTING" || gameState === "CONTEXT_REVEAL") && (
        <TelaoContextScreen
          theme={roomData?.theme || "AGUARDANDO VOTAÇÃO..."}
          contextText={roomData?.contextText || ""}
          players={players}
          // Garante que o estado atual da sala seja passado para sumir o painel de votação no momento exato
          currentGameState={gameState}
          onTimeoutVotacao={apurarEAvancarTema}
          onSequenceComplete={async () => {
            if (roomData?.contextText) {
              await set(ref(rtdb, `rooms/${roomCode}/liveData/currentText`), roomData.contextText);
            }
            await updateDoc(doc(db, "rooms", roomCode), { gameState: "TYPING_ROUND_1" });
          }}
        />
      );

      {/* 3. TELA DE PARTIDA EM TEMPO REAL */}
      {gameState === "TYPING_ROUND_1" && (
        <TelaoMatchScreen
          currentRound={1}
          activeTeam={roomData?.activeTeam || "TIME_A"}
          theme={roomData?.theme || ""}
          contextText={roomData?.contextText}
          currentText={currentText || roomData?.contextText || ""} 
          timeLeft={30}
          activeCursors={activeCursors} 
          isTypingMap={isTypingMap} 
        />
      );

      {/* 4. TELA DE RESULTADOS */}
      {gameState === "RESULTS" && (
        <TelaoResultsScreen
          rankings={players} 
          onNewGame={async () => {
            await updateDoc(doc(db, "rooms", roomCode), { gameState: "LOBBY", contextText: "", theme: "" });
          }}
        />
      )}
    </div>
  );
}