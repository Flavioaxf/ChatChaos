'use client';
import React, { useState, useEffect } from 'react';

interface Player {
  id: string;
  name: string;
  avatar: string;
}

interface TelaoContextScreenProps {
  theme: string;
  contextText: string;
  players: Player[];
  onSequenceComplete: () => void;
}

export default function TelaoContextScreen({ theme, contextText, players, onSequenceComplete }: TelaoContextScreenProps) {
  const [step, setStep] = useState(0);
  const [readyPlayers, setReadyPlayers] = useState<string[]>([]);
  const [typewriterText, setTypewriterText] = useState('');

  // Coreografia de Tempos
  useEffect(() => {
    if (step === 0) setTimeout(() => setStep(1), 3500); // TEMA -> PREMISSA
    if (step === 1) setTimeout(() => setStep(2), 6000); // PREMISSA -> ROUND 1 (Sincronização)
  }, [step]);

  // Efeito Máquina de Escrever para o Texto do Contexto (Passo 1)
  useEffect(() => {
    if (step === 1) {
      let i = 0;
      const interval = setInterval(() => {
        setTypewriterText(contextText.slice(0, i));
        i++;
        if (i > contextText.length) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [step, contextText]);

  // SIMULAÇÃO: Jogadores apertando "PRONTO" no celular um por um (Passo 2)
  useEffect(() => {
    if (step === 2) {
      const interval = setInterval(() => {
        setReadyPlayers(prev => {
          if (prev.length < players.length) {
            return [...prev, players[prev.length].id];
          }
          clearInterval(interval);
          return prev;
        });
      }, 1200); // A cada 1.2s um jogador simula o "Pronto"
      return () => clearInterval(interval);
    }
  }, [step, players]);

  // Quando todos estiverem prontos, finaliza a tela e vai pra partida
  useEffect(() => {
    if (step === 2 && readyPlayers.length === players.length) {
      setTimeout(() => {
        onSequenceComplete();
      }, 1500); // Espera 1.5s após o último dar pronto para dar o salto
    }
  }, [readyPlayers, players, step, onSequenceComplete]);

  return (
    <main className="min-h-screen bg-[#1C1C1C] text-[#FF6B35] p-8 md:p-12 flex flex-col justify-between font-sans select-none relative overflow-hidden">
      
      {/* GARANTIA DA FONTE E EFEITOS CRT */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        .font-pixel { font-family: 'VT323', monospace !important; }
        
        @keyframes crtFlicker {
          0% { opacity: 0.95; }
          5% { opacity: 0.85; }
          10% { opacity: 0.95; }
          15% { opacity: 1; }
          100% { opacity: 1; }
        }
        .animate-crt { animation: crtFlicker 0.15s infinite; }
      `}} />

      {/* OVERLAY DE SCANLINES CRT */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-50" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)' }}></div>

      {/* CABEÇALHO DO SISTEMA */}
      <div className="border-b-[4px] border-[#FF6B35] pb-4 opacity-80 flex justify-between font-pixel text-xl tracking-widest z-10 uppercase">
        <span>INCOMING_TRANSMISSION: ADMIN_SERVER_</span>
        <span className="animate-pulse">● SECURE_CHANNEL_ACTIVE_</span>
      </div>

      <div className="max-w-5xl mx-auto my-auto w-full z-10 flex flex-col items-center">
        
        {/* PASSO 0: O TEMA (Alvo do Hack) */}
        {step === 0 && (
          <div className="text-center animate-fade-in flex flex-col items-center">
            <span className="font-pixel text-2xl md:text-3xl tracking-widest text-[#888] mb-4">// ESTABELECENDO_ALVO:</span>
            <div className="bg-[#FF6B35] text-[#1C1C1C] border-[4px] border-[#FF6B35] px-8 py-4 shadow-[8px_8px_0px_#888888] transform -rotate-2">
              <h1 className="font-pixel text-[clamp(3rem,6vw,5rem)] tracking-widest uppercase leading-none">
                {theme}
              </h1>
            </div>
            <span className="font-pixel text-xl tracking-widest text-[#FF6B35] mt-12 animate-pulse">
              EXTRAINDO_DADOS...
            </span>
          </div>
        )}

        {/* PASSO 1: A PREMISSA / ALERTA DE SEGURANÇA */}
        {step === 1 && (
          <div className="w-full border-[4px] border-[#FF6B35] p-8 md:p-12 rounded-[4px] bg-black bg-opacity-40 animate-crt shadow-[12px_12px_0px_rgba(255,107,53,0.2)]">
            <h2 className="text-3xl md:text-5xl font-pixel mb-8 tracking-widest text-[#C8381E] uppercase animate-pulse border-b-[4px] border-dashed border-[#C8381E] pb-4">
              [!] ALERTA_DE_SEGURANCA [!]
            </h2>
            <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-pixel leading-tight tracking-wide text-[#F7F5F0]">
              {typewriterText}<span className="animate-pulse text-[#FF6B35]">_</span>
            </p>
          </div>
        )}

        {/* PASSO 2: ROUND 1 E SINCRONIZAÇÃO DE DISPOSITIVOS */}
        {step === 2 && (
          <div className="w-full flex flex-col items-center animate-fade-in">
            
            <div className="text-center mb-12">
              <h2 className="font-pixel text-5xl md:text-7xl text-[#F7F5F0] tracking-widest uppercase mb-2" style={{ textShadow: '4px 4px 0px #FF6B35' }}>
                ROUND 1
              </h2>
              <p className="font-pixel text-2xl tracking-widest text-[#888] uppercase">
                DISTRIBUINDO_PAPEIS_CRIPTOGRAFADOS_
              </p>
            </div>

            <div className="w-full max-w-3xl bg-[#FF6B35] border-[4px] border-[#FF6B35] p-6 text-[#1C1C1C] shadow-[8px_8px_0px_#888888]">
              <div className="font-pixel text-2xl font-bold tracking-widest border-b-[4px] border-[#1C1C1C] pb-4 mb-6 flex justify-between items-end">
                <span>VERIFIQUE SEU CELULAR</span>
                <span className="text-lg">[{readyPlayers.length}/{players.length}]</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {players.map((player) => {
                  const isReady = readyPlayers.includes(player.id);
                  return (
                    <div key={player.id} className={`flex items-center justify-between p-3 border-[4px] font-pixel text-xl tracking-widest transition-all duration-300
                      ${isReady ? 'bg-[#1C1C1C] text-[#FF6B35] border-[#1C1C1C]' : 'bg-transparent text-[#1C1C1C] border-[#1C1C1C] opacity-60'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{player.avatar}</span>
                        <span>{player.name}</span>
                      </div>
                      <span className={isReady ? 'animate-pulse' : ''}>
                        {isReady ? '[OK]' : '[WAIT]'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {readyPlayers.length === players.length && (
                <div className="mt-8 bg-[#1C1C1C] text-[#F7F5F0] p-4 text-center font-pixel text-3xl tracking-widest uppercase animate-pulse border-[4px] border-[#1C1C1C]">
                  &gt;&gt;&gt; TODOS_OS_NOS_SINCRONIZADOS &lt;&lt;&lt;
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* RODAPÉ */}
      <div className="border-t-[4px] border-[#FF6B35] pt-4 opacity-60 flex justify-between font-pixel text-lg tracking-widest z-10">
        <span>SYS_SECURE_PROTOCOL_VT100</span>
        <span>NO_EMOJIS_ALLOWED</span>
      </div>
    </main>
  );
}