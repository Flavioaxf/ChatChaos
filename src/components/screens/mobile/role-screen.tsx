'use client';
import React, { useState, useEffect } from 'react';

interface MobileRoleScreenProps {
  playerName?: string;
  avatar?: string;
  theme?: string;
  role?: 'NORMAL' | 'HACKEADO' | 'INVERSOR' | 'BEBADO' | 'MANDARIM';
  onReady?: () => void;
}

export function RoleScreen({
  playerName = 'HACKER_99',
  avatar = '(>_<)',
  theme = 'FESTA DA EMPRESA',
  role = 'HACKEADO',
  onReady
}: MobileRoleScreenProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [glitchText, setGlitchText] = useState('????????');

  const ROLE_DETAILS = {
    NORMAL: {
      color: '#06D6A0',
      title: 'AGENTE NORMAL',
      mission: 'Sua missão é simples: digite colaborativamente com a equipe e tente manter o sentido do texto baseado no tema.',
    },
    HACKEADO: {
      color: '#C8381E',
      title: 'SISTEMA HACKEADO',
      mission: 'ATENÇÃO! Seu teclado foi infectado. Algumas teclas farão coisas inesperadas. Tente sobreviver e escrever o que puder!',
    },
    INVERSOR: {
      color: '#9D4EDD',
      title: 'AGENTE INVERSOR',
      mission: 'Você é o sabotador silencioso. Tente inverter o sentido da história ou causar o caos sem que os outros percebam que foi você.',
    },
    BEBADO: {
      color: '#FFD166',
      title: 'SISTEMA EMBRIAGADO',
      mission: 'Seu cursor está fora de controle! Ele vai se mover sozinho enquanto você digita. Boa sorte tentando formar uma frase.',
    },
    MANDARIM: {
      color: '#FF6B35',
      title: 'TRADUTOR QUEBRADO',
      mission: 'Tudo o que você digitar será processado de forma caótica. Apenas digite e veja o mundo queimar.',
    }
  };

  const currentRole = ROLE_DETAILS[role] || ROLE_DETAILS.NORMAL;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDecrypting) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
      interval = setInterval(() => {
        let randomStr = '';
        for (let i = 0; i < 8; i++) {
          randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setGlitchText(randomStr);
      }, 50);

      setTimeout(() => {
        clearInterval(interval);
        setIsDecrypting(false);
        setIsRevealed(true);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isDecrypting]);

  const handleReveal = () => {
    setIsDecrypting(true);
  };

  return (
    <main className="min-h-screen w-full bg-[#EDEBE5] text-[#1C1C1C] flex flex-col font-sans p-4 sm:p-6 select-none overflow-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=VT323&display=swap');
        .font-pixel { font-family: 'VT323', monospace !important; }
        .font-project-sans { font-family: 'DM Sans', sans-serif !important; }
        
        .shadow-hard { box-shadow: 4px 4px 0px #1C1C1C; }
        @media (min-width: 640px) {
          .shadow-hard { box-shadow: 6px 6px 0px #1C1C1C; }
        }

        @keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-pulse-fast { animation: pulse-fast 0.3s infinite; }
        
        @keyframes pop-in { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-pop { animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.2) forwards; }
      `}} />

      {/* HEADER: Ajustado com gap maior e margem de distanciamento para o tema */}
      <header className="w-full flex flex-col items-center py-2 mb-8 shrink-0 gap-5">
        <div className="w-full flex justify-between items-center bg-[#1C1C1C] text-[#F7F5F0] px-4 py-3 border-[3px] sm:border-[4px] border-[#1C1C1C] shadow-hard">
          <span className="font-pixel text-2xl uppercase tracking-widest">{playerName}</span>
          <span className="font-pixel text-3xl text-[#FF6B35]">{avatar}</span>
        </div>
        <div className="bg-[#FF6B35] px-5 py-2 border-[3px] sm:border-[4px] border-[#1C1C1C] shadow-hard transform rotate-1 mt-2">
          <span className="font-pixel text-2xl uppercase font-bold text-[#1C1C1C] tracking-widestA">
            TEMA: {theme}
          </span>
        </div>
      </header>

      {/* ÁREA CENTRAL */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto">
        
        {!isRevealed ? (
          <div className="w-full bg-[#1C1C1C] border-[4px] sm:border-[6px] border-[#1C1C1C] p-8 flex flex-col items-center text-center shadow-hard">
            <h2 className="font-pixel text-[#F7F5F0] text-3xl sm:text-4xl uppercase mb-6 tracking-widest border-b-[4px] border-[#333] pb-4 w-full">
              ARQUIVO CONFIDENCIAL
            </h2>
            
            <div className="w-full bg-[#0A0A0A] p-6 border-[4px] border-[#333] mb-8 min-h-[120px] flex items-center justify-center">
              <span className={`font-pixel text-4xl sm:text-5xl tracking-[0.3em] ${isDecrypting ? 'text-[#06D6A0] animate-pulse-fast' : 'text-[#888]'}`}>
                {isDecrypting ? glitchText : '********'}
              </span>
            </div>

            <button
              onClick={handleReveal}
              disabled={isDecrypting}
              className="w-full bg-[#FF6B35] text-[#1C1C1C] border-[4px] border-[#1C1C1C] py-4 font-pixel text-3xl sm:text-4xl uppercase font-bold tracking-widest hover:bg-[#F7F5F0] transition-colors disabled:opacity-50 active:translate-y-1 shadow-[4px_4px_0px_#000]"
            >
              {isDecrypting ? 'PROCESSANDO...' : 'DESCRIPTOGRAFAR'}
            </button>
          </div>
        ) : (
          <div className="w-full bg-[#1C1C1C] border-[4px] sm:border-[6px] border-[#1C1C1C] p-6 sm:p-8 flex flex-col items-center shadow-hard animate-pop">
            
            <div className="w-full bg-[#F7F5F0] border-[4px] border-[#1C1C1C] p-2 text-center mb-6 transform -rotate-1 shadow-[4px_4px_0px_#FF6B35]">
              <span className="font-pixel text-[#1C1C1C] text-xl sm:text-2xl font-bold tracking-widest uppercase">
                SEU PAPEL NESTA RODADA:
              </span>
            </div>

            <div 
              className="w-full py-6 px-4 border-[4px] sm:border-[6px] border-[#1C1C1C] mb-6 flex items-center justify-center"
              style={{ backgroundColor: currentRole.color }}
            >
              <h1 className="font-pixel text-4xl sm:text-5xl text-[#1C1C1C] font-bold uppercase tracking-widest text-center leading-none">
                {currentRole.title}
              </h1>
            </div>

            {/* Caixa de Objetivo com a fonte DM Sans (font-project-sans) configurada */}
            <div className="w-full bg-[#2A2A2A] border-[4px] border-[#1C1C1C] p-4 sm:p-5 mb-8">
              <span className="font-pixel text-[#888] text-lg uppercase tracking-widest block mb-2 border-b-[2px] border-[#444] pb-1">
                OBJETIVO_
              </span>
              <p className="font-project-sans text-[#F7F5F0] text-base sm:text-lg font-bold leading-relaxed">
                {currentRole.mission}
              </p>
            </div>

            <button
              onClick={onReady}
              className="w-full bg-[#EDEBE5] text-[#1C1C1C] border-[4px] border-[#1C1C1C] py-4 sm:py-5 font-pixel text-3xl sm:text-4xl uppercase font-bold tracking-widest hover:bg-[#FF6B35] transition-colors active:translate-y-1 shadow-[4px_4px_0px_#000]"
            >
              [ ESTOU PRONTO ]
            </button>
          </div>
        )}
      </div>

    </main>
  );
}