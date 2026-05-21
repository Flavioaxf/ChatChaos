'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';

// Imports com caminhos relativos corrigidos para evitar erros de compilação
import TelaoLobbyScreen from '../../../components/screens/telao/telao-lobby-screen';
import TelaoMatchScreen from '../../../components/screens/telao/telao-match-screen';
import TelaoResultsScreen from '../../../components/screens/telao/telao-results-screen';

// Definição de todos os estados possíveis que o telão pode assumir
type GameState = 'LOBBY' | 'CONTEXT_REVEAL' | 'MATCH' | 'RESULTS';

export default function TelaoJogoPage() {
  const params = useParams();
  const roomCode = params.code as string;
  
  // O estado inicial começa no Lobby do jogo
  const [gameState, setGameState] = useState<GameState>('LOBBY');

  // --- DADOS SIMULADOS PARA TESTE VISUAL NO FRONT-END ---
  const jogadoresSimulados = [
    { id: '1', name: 'FLAVIO_AXF', avatar: '(>_<)', score: 120, secretRole: 'MANDARIM' },
    { id: '2', name: 'DUPLA_BACK', avatar: '(O_O)', score: 95, secretRole: 'HACKEADO' },
    { id: '3', name: 'RAUL_PARADEDA', avatar: '(^_-)', score: 40, secretRole: 'IRRITADO' },
  ];

  const cursoresSimulados = [
    { playerId: '1', playerName: 'FLAVIO_AXF', color: '#FF6B35' },
    { playerId: '2', playerName: 'DUPLA_BACK', color: '#4A90E2' },
  ];

  return (
    <div className="relative min-h-screen font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes revealLobby {
          0%, 30% { opacity: 1; }
          100% { opacity: 0; visibility: hidden; }
        }
        .animate-reveal { animation: revealLobby 1.2s ease-out forwards; }
      `}} />
      <div className="fixed inset-0 z-[9999] bg-[#1C1C1C] animate-reveal pointer-events-none flex items-center justify-center">
         <span className="font-mono text-[#FF6B35] text-2xl tracking-widest animate-pulse">LOBBY_MAINFRAME_ONLINE_</span>
      </div>

      {/* 1. TELA DE LOBBY (Aguardando conexões) */}
      {gameState === 'LOBBY' && (
        <TelaoLobbyScreen 
          roomCode={roomCode} 
          players={jogadoresSimulados}
          onStartGame={() => setGameState('CONTEXT_REVEAL')}
        />
      )}

      {/* 2. TELA DE CONTEXTO ÂMBAR CRT (Inversão de Cores) */}
      {gameState === 'CONTEXT_REVEAL' && (
        <main className="min-h-screen bg-[#1C1C1C] text-[#FF6B35] p-12 flex flex-col justify-between font-mono select-none">
          <div className="border-b border-[#FF6B35] pb-4 opacity-80 flex justify-between text-xs tracking-widest">
            <span>INCOMING_MESSAGE_FROM: ADMIN_SERVER_</span>
            <span className="animate-pulse">● ONLINE_</span>
          </div>

          <div className="max-w-4xl mx-auto my-auto w-full">
            <div className="border-2 border-[#FF6B35] p-8 rounded-[8px] bg-black bg-opacity-30">
              <h2 className="text-2xl font-bold mb-6 style-vt323 tracking-wider text-[#C8381E] uppercase animate-pulse">
                [!] ALERTA_DE_SEGURANCA_SISTEMA [!]
              </h2>
              <p className="text-4xl font-normal leading-relaxed tracking-wide style-vt323">
                ATIVIDADE SUSPEITA DETECTADA NO SERVIDOR CENTRAL. JUSTIFIQUE IMEDIATAMENTE SUA PRESENÇA OU O SISTEMA OPERACIONAL SERÁ COMPLETAMENTE FORMATADO EM 60 SEGUNDOS.
              </p>
            </div>
            <div className="mt-8 text-center text-sm opacity-60 animate-bounce style-vt323 tracking-widest">
              PREPARE-SE PARA ENVIAR A RESPOSTA_AUTOMATICA (`REPLY_`)
            </div>
          </div>
          
          <div className="border-t border-[#FF6B35] pt-4 opacity-40 text-center text-xs tracking-widest">
            SYS_SECURE_PROTOCOL_VT100 // NO_EMOJIS_ALLOWED
          </div>
        </main>
      )}

      {/* 3. TELA DE PARTIDA / DIGITAÇÃO COOPERATIVA */}
      {gameState === 'MATCH' && (
        <TelaoMatchScreen 
          currentRound={1}
          activeTeam="TIME_A"
          theme="Grupo da Empresa"
          currentText="REPLY_: Olá chefia, peço desculpas pelo acesso indevido, mas estávamos apenas testando a vulnerabilidade do"
          timeLeft={32}
          activeCursors={cursoresSimulados}
        />
      )}

      {/* 4. TELA DE RESULTADOS FINAIS (Placar Geral) */}
      {gameState === 'RESULTS' && (
        <TelaoResultsScreen 
          rankings={jogadoresSimulados}
          onNewGame={() => setGameState('LOBBY')}
        />
      )}

      {/* ======================================================= */}
      {/* MENU DE DEBUG TEMPORÁRIO (Apenas para testar o Front) */}
      {/* ======================================================= */}
      <div className="fixed bottom-4 left-4 bg-[#EDEBE5] p-3 rounded-[8px] border-2 border-[#1C1C1C] flex gap-2 z-50 shadow-lg">
        <span className="text-xs font-bold mr-2 text-[#888888] my-auto">DEBUG FRONT-END:</span>
        <button 
          onClick={() => setGameState('LOBBY')} 
          className="text-xs font-bold px-3 py-1 bg-white border border-[#D0CEC8] rounded hover:bg-gray-100 transition-colors"
        >
          1. Lobby
        </button>
        <button 
          onClick={() => setGameState('CONTEXT_REVEAL')} 
          className="text-xs font-bold px-3 py-1 bg-white border border-[#D0CEC8] rounded hover:bg-gray-100 transition-colors"
        >
          2. Contexto
        </button>
        <button 
          onClick={() => setGameState('MATCH')} 
          className="text-xs font-bold px-3 py-1 bg-white border border-[#D0CEC8] rounded hover:bg-gray-100 transition-colors"
        >
          3. Partida
        </button>
        <button 
          onClick={() => setGameState('RESULTS')} 
          className="text-xs font-bold px-3 py-1 bg-white border border-[#D0CEC8] rounded hover:bg-gray-100 transition-colors"
        >
          4. Resultados
        </button>
      </div>

    </div>
  );
}