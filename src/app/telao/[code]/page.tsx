'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';

// Imports com caminhos relativos
import TelaoLobbyScreen from '../../../components/screens/telao/telao-lobby-screen';
import TelaoContextScreen from '../../../components/screens/telao/telao-context-screen';
import TelaoMatchScreen from '../../../components/screens/telao/telao-match-screen';
import TelaoResultsScreen from '../../../components/screens/telao/telao-results-screen';

type GameState = 'LOBBY' | 'CONTEXT_REVEAL' | 'MATCH' | 'RESULTS';

export default function TelaoJogoPage() {
  const params = useParams();
  const roomCode = params.code as string;
  const [gameState, setGameState] = useState<GameState>('LOBBY');

  const jogadoresSimulados = [
    { id: '1', name: 'FLAVIO_AXF', avatar: '(>_<)', score: 120, secretRole: 'MANDARIM' },
    { id: '2', name: 'DUPLA_BACK', avatar: '(O_O)', score: 95, secretRole: 'HACKEADO' },
    { id: '3', name: 'RAUL_PARADEDA', avatar: '(^_-)', score: 40, secretRole: 'IRRITADO' },
    { id: '4', name: 'PLAYER_4', avatar: '(T_T)', score: 0, secretRole: 'NORMAL' },
  ];

  const cursoresSimulados = [
    { playerId: '1', playerName: 'FLAVIO_AXF', color: '#FF6B35', avatar: '(>_<)' },
    { playerId: '2', playerName: 'DUPLA_BACK', color: '#4A90E2', avatar: '(O_O)' },
  ];

  return (
    <div className="relative min-h-screen font-sans">
      
      {/* ANIMAÇÃO DE ENTRADA DO LOBBY */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes revealLobby {
          0%, 20% { opacity: 1; }
          100% { opacity: 0; visibility: hidden; }
        }
        .animate-reveal { animation: revealLobby 1.2s ease-out forwards; }
      `}} />
      <div className="fixed inset-0 z-[9999] bg-[#1C1C1C] animate-reveal pointer-events-none flex items-center justify-center">
         <span className="font-mono text-[#FF6B35] text-2xl tracking-widest animate-pulse">LOBBY_MAINFRAME_ONLINE_</span>
      </div>

      {/* 1. TELA DE LOBBY */}
      {gameState === 'LOBBY' && (
        <TelaoLobbyScreen 
          roomCode={roomCode} 
          players={jogadoresSimulados}
          onStartGame={() => setGameState('CONTEXT_REVEAL')}
        />
      )}

      {/* 2. TELA DE CONTEXTO E SINCRONIZAÇÃO (Novo Componente) */}
      {gameState === 'CONTEXT_REVEAL' && (
        <TelaoContextScreen
          theme="Grupo da Empresa"
          contextText="ATIVIDADE SUSPEITA DETECTADA NO SERVIDOR CENTRAL. JUSTIFIQUE IMEDIATAMENTE SUA PRESENÇA OU O SISTEMA OPERACIONAL SERÁ COMPLETAMENTE FORMATADO EM 60 SEGUNDOS."
          players={jogadoresSimulados}
          onSequenceComplete={() => setGameState('MATCH')}
        />
      )}

      {/* 3. TELA DE PARTIDA */}
      {gameState === 'MATCH' && (
        <TelaoMatchScreen 
          currentRound={1}
          activeTeam="TIME_A"
          theme="Grupo da Empresa"
          contextText="ATIVIDADE SUSPEITA DETECTADA NO SERVIDOR CENTRAL. JUSTIFIQUE IMEDIATAMENTE SUA PRESENÇA OU O SISTEMA OPERACIONAL SERÁ COMPLETAMENTE FORMATADO."
          currentText="REPLY_: Olá chefia, peço desculpas pelo acesso indevido, mas estávamos apenas testando a vulnerabilidade do"
          timeLeft={30}
          activeCursors={cursoresSimulados}
        />
      )}

      {/* 4. TELA DE RESULTADOS */}
      {gameState === 'RESULTS' && (
        <TelaoResultsScreen 
          rankings={jogadoresSimulados}
          onNewGame={() => setGameState('LOBBY')}
        />
      )}

      {/* MENU DE DEBUG */}
      <div className="fixed bottom-4 left-4 bg-[#EDEBE5] p-3 rounded-[8px] border-2 border-[#1C1C1C] flex gap-2 z-50 shadow-lg">
        <span className="text-xs font-bold mr-2 text-[#888888] my-auto">DEBUG:</span>
        <button onClick={() => setGameState('LOBBY')} className="text-xs font-bold px-3 py-1 bg-white border border-[#D0CEC8] rounded">1</button>
        <button onClick={() => setGameState('CONTEXT_REVEAL')} className="text-xs font-bold px-3 py-1 bg-white border border-[#D0CEC8] rounded">2</button>
        <button onClick={() => setGameState('MATCH')} className="text-xs font-bold px-3 py-1 bg-white border border-[#D0CEC8] rounded">3</button>
        <button onClick={() => setGameState('RESULTS')} className="text-xs font-bold px-3 py-1 bg-white border border-[#D0CEC8] rounded">4</button>
      </div>

    </div>
  );
}