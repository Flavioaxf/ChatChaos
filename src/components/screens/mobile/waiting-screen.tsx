'use client';
import React, { useState, useEffect } from 'react';

interface WaitingScreenProps {
  playerName: string;
  avatar: string;
  roomCode: string;
  playersConnected?: number;
}

const WAITING_MESSAGES = [
  "AGUARDANDO AUTORIZAÇÃO DO HOST...",
  "SINCRONIZANDO COM O SERVIDOR...",
  "ESTABELECENDO CONEXÃO SEGURA...",
  "VERIFICANDO CREDENCIAIS...",
  "AGUARDANDO OUTROS AGENTES...",
  "SISTEMA EM STANDBY...",
];

export function WaitingScreen({ playerName, avatar, roomCode, playersConnected = 1 }: WaitingScreenProps) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [dots, setDots] = useState('');

  // Rotaciona as mensagens de espera
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % WAITING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Anima os pontos de loading
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen w-full bg-[#1C1C1C] text-[#F7F5F0] flex flex-col items-center justify-between p-6 select-none">

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        .font-pixel { font-family: 'VT323', monospace !important; }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .animate-blink { animation: blink 0.8s step-end infinite; }

        @keyframes pulse-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }

        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .animate-scan { animation: scan 3s linear infinite; }
      `}} />

      {/* HEADER — identidade e sala */}
      <div className="w-full flex justify-between items-start pt-2">
        <div className="flex flex-col gap-1">
          <span className="font-pixel text-[#888888] text-lg tracking-widest">
            AGENTE_CONECTADO:
          </span>
          <span className="font-pixel text-[#FF6B35] text-2xl tracking-wider">
            {playerName}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-pixel text-[#888888] text-lg tracking-widest">
            SESSION_HASH:
          </span>
          <span className="font-pixel text-[#F7F5F0] text-2xl tracking-widest border border-[#333] px-3 py-1">
            {roomCode}
          </span>
        </div>
      </div>

      {/* CENTRO — avatar e status */}
      <div className="flex flex-col items-center gap-8 w-full">

        {/* Avatar grande piscando */}
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-32 h-32 border-2 border-[#FF6B35] flex items-center justify-center relative overflow-hidden">
            {/* Linha de scan estilo CRT */}
            <div className="absolute w-full h-[2px] bg-[#FF6B35] opacity-20 animate-scan pointer-events-none" />
            <span className="font-pixel text-5xl text-[#FF6B35] animate-pulse-slow">
              {avatar}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#06D6A0] animate-blink" />
            <span className="font-pixel text-[#06D6A0] text-xl tracking-widest">
              ONLINE
            </span>
          </div>
        </div>

        {/* Mensagem rotativa */}
        <div className="w-full border border-[#333] p-4 text-center">
          <p className="font-pixel text-[#FF6B35] text-xl sm:text-2xl tracking-wider leading-snug">
            {WAITING_MESSAGES[msgIndex]}{dots}
          </p>
        </div>

        {/* Contador de jogadores */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-pixel text-[#888888] text-lg tracking-widest">
            NODES_CONECTADOS:
          </span>
          <span className="font-pixel text-4xl text-[#F7F5F0]">
            {playersConnected}
          </span>
        </div>
      </div>

      {/* RODAPÉ — instrução */}
      <div className="w-full border-t border-[#333] pt-6 text-center">
        <p className="font-pixel text-[#888888] text-lg sm:text-xl tracking-wider leading-relaxed">
          AGUARDE O HOST INICIAR A SESSÃO
          <span className="animate-blink">_</span>
        </p>
        <p className="font-pixel text-[#444] text-base tracking-wider mt-2">
          NÃO FECHE ESTA TELA
        </p>
      </div>

    </main>
  );
}