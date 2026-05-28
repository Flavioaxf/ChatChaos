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
  theme = 'CIBERSEGURANÇA NA UERN',
  role = 'HACKEADO',
  onReady
}: MobileRoleScreenProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [glitchText, setGlitchText] = useState('????????');
  const [readyClicked, setReadyClicked] = useState(false);
  
  // Estado para fazer o nome do bêbado mutar em tempo real
  const [drunkName, setDrunkName] = useState('bebbaaado');

  // EFEITO MUTANTE PARA O NOME DO BÊBADO
  useEffect(() => {
    if (role !== 'BEBADO') return;
    const variacoes = ['bbebadddo', 'bebbaadooo', 'bbeebado', 'bbebbaaddoo', 'bebadooo', 'bbbeebado'];
    const interval = setInterval(() => {
      const aleatorio = variacoes[Math.floor(Math.random() * variacoes.length)];
      setDrunkName(aleatorio);
    }, 400);
    return () => clearInterval(interval);
  }, [role]);

  const ROLE_DETAILS = {
    NORMAL: {
      color: '#06D6A0',
      title: 'AGENTE NORMAL',
      mission: 'Digite colaborativamente com a equipe. Mantenha o sentido do texto baseado no tema.',
    },
    HACKEADO: {
      color: '#C8381E',
      title: 'H4ck3ad0',
      mission: '01 ATENÇÃO! 10 Seu teclado 01 foi infectado 11 por um malware. 10 Algumas teclas 01 vão falhar, 11 tente escrever 01 assim mesmo!',
    },
    INVERSOR: {
      color: '#9D4EDD',
      title: 'IRRITADO!!!',
      mission: 'VOCÊ ESTÁ FURIOSO COM ESTE SISTEMA CRASHADO! DIGITE TUDO AGRESSIVAMENTE E CAUSE O CAOS TOTAL NA HISTÓRIA ANTES DO FORMAT COMPLETO?',
    },
    BEBADO: {
      color: '#FFD166',
      title: drunkName,
      mission: 'Seuuu curssoor t táá m-movendo s-sozinhooo... Issso t tá t-tudo zonzo, masss diggitta o quue d-dár pra l-ler!',
    },
    MANDARIM: {
      color: '#FF6B35',
      title: '翻译错误 (Mandarim)',
      mission: '您的键盘已被完全破坏。Texto primeiro em mandarim, tudo o que você digitar será caótico.',
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

  const handleReadyClick = () => {
    setReadyClicked(true);
    if (onReady) onReady();
  };

  return (
    <main className="h-[100dvh] w-full bg-[#EDEBE5] text-[#1C1C1C] flex flex-col font-sans p-4 sm:p-5 select-none overflow-hidden justify-between">
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=VT323&display=swap');
        .font-pixel { font-family: 'VT323', monospace !important; }
        .font-project-sans { font-family: 'DM Sans', sans-serif !important; }
        .shadow-hard { box-shadow: 4px 4px 0px #1C1C1C; }
        .rounded-brutalist { border-radius: 8px !important; }
        @keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-pulse-fast { animation: pulse-fast 0.3s infinite; }
        @keyframes pop-in { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-pop { animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1) forwards; }
      `}} />

      {/* HEADER BAR COM GAP CORRIGIDO */}
      <header className="w-full flex flex-col items-center shrink-0">
        <div className="w-full flex justify-between items-center bg-[#1C1C1C] text-[#F7F5F0] px-4 py-2 border-[3px] border-[#1C1C1C] shadow-hard rounded-brutalist">
          <span className="font-pixel text-xl sm:text-2xl uppercase tracking-widest truncate pr-2">{playerName}</span>
          <span className="font-pixel text-2xl sm:text-3xl text-[#FF6B35]">{avatar}</span>
        </div>
        
        {/* BLOCO DE TEMA CENTRALIZADO VERTICALMENTE ENTRE O TOPO E O CARD DO PAPEL */}
        <div className="my-6 bg-[#FF6B35] px-4 py-1.5 border-[3px] border-[#1C1C1C] shadow-hard transform rotate-1 rounded-brutalist inline-block mx-auto">
          <span className="font-pixel text-xl uppercase font-bold text-[#1C1C1C] tracking-wider">
            TEMA: {theme}
          </span>
        </div>
      </header>

      {/* ÁREA CENTRAL CONTAINER */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto min-h-0">
        
        {!isRevealed ? (
          <div className="w-full bg-[#1C1C1C] border-[4px] border-[#1C1C1C] p-6 flex flex-col items-center text-center shadow-hard rounded-brutalist">
            <h2 className="font-pixel text-[#F7F5F0] text-2xl sm:text-3xl uppercase mb-4 tracking-widest border-b-[3px] border-[#333] pb-3 w-full">
              ARQUIVO CONFIDENCIAL
            </h2>
            
            <div className="w-full bg-[#0A0A0A] py-4 px-6 border-[3px] border-[#333] mb-5 min-h-[80px] flex items-center justify-center rounded-[4px]">
              <span className={`font-pixel text-3xl sm:text-4xl tracking-[0.3em] ${isDecrypting ? 'text-[#06D6A0] animate-pulse-fast' : 'text-[#888]'}`}>
                {isDecrypting ? glitchText : '********'}
              </span>
            </div>

            <button
              onClick={() => setIsDecrypting(true)}
              disabled={isDecrypting}
              className="w-full bg-[#FF6B35] text-[#1C1C1C] border-[4px] border-[#1C1C1C] py-3 font-pixel text-2xl sm:text-3xl uppercase font-bold tracking-widest hover:bg-[#F7F5F0] transition-colors rounded-brutalist disabled:opacity-50 active:translate-y-0.5 active:shadow-none shadow-hard"
            >
              {isDecrypting ? 'PROCESSANDO...' : 'DESCRIPTOGRAFAR'}
            </button>
          </div>
        ) : (
          <div className="w-full bg-[#1C1C1C] border-[4px] border-[#1C1C1C] p-5 sm:p-6 flex flex-col items-center shadow-hard animate-pop rounded-brutalist h-auto min-h-0">
            
            <div className="w-full bg-[#F7F5F0] border-[3px] border-[#1C1C1C] p-1.5 text-center mb-4 transform -rotate-1 shadow-[3px_3px_0px_#FF6B35] rounded-[4px] shrink-0">
              <span className="font-pixel text-[#1C1C1C] text-lg sm:text-xl font-bold tracking-widest uppercase">
                SEU PAPEL NESTA RODADA:
              </span>
            </div>

            <div 
              className="w-full py-4 px-3 border-[3px] border-[#1C1C1C] mb-4 flex items-center justify-center rounded-[4px] shrink-0 h-16"
              style={{ backgroundColor: currentRole.color }}
            >
              <h1 className="font-pixel text-3xl sm:text-4xl text-[#1C1C1C] font-bold uppercase tracking-widest text-center leading-none truncate w-full">
                {currentRole.title}
              </h1>
            </div>

            {/* CAIXA DE TEXTO COM PREVENÇÃO DE SCROLL E TIPOGRAFIA CORRETA DO PROJETO (DM SANS) */}
            <div className="w-full bg-[#2A2A2A] border-[3px] border-[#1C1C1C] p-4 mb-6 rounded-[4px]">
              <span className="font-pixel text-[#888] text-xs uppercase tracking-widest block mb-1 border-b-[2px] border-[#444] pb-0.5">
                OBJETIVO_
              </span>
              <p className="font-project-sans text-[#F7F5F0] text-base sm:text-lg font-bold leading-relaxed">
                {currentRole.mission}
              </p>
            </div>

            {/* BOTÃO COMPORTAMENTAL: ATUALIZA ESTADO, COR LARANJA E TRAVA AO SER CLICADO */}
            <button
              onClick={handleReadyClick}
              disabled={readyClicked}
              className={`w-full border-[4px] border-[#1C1C1C] py-3 font-pixel text-2xl sm:text-3xl uppercase font-bold tracking-widest transition-all rounded-brutalist shadow-hard shrink-0
                ${readyClicked 
                  ? 'bg-[#FF6B35] text-[#1C1C1C] translate-y-0.5 shadow-none opacity-100 cursor-not-allowed' 
                  : 'bg-[#EDEBE5] text-[#1C1C1C] hover:bg-[#FF6B35] active:translate-y-0.5 active:shadow-none'
                }
              `}
            >
              {readyClicked ? '[ AGUARDANDO NÓS... ]' : '[ ESTOU PRONTO ]'}
            </button>
          </div>
        )}
      </div>

      {/* RODAPÉ DO DISPOSITIVO */}
      <div className="w-full shrink-0 bg-[#1C1C1C] border-[3px] border-[#1C1C1C] text-[#F7F5F0] py-2 text-center rounded-brutalist font-pixel text-sm uppercase tracking-widest opacity-40">
        SECURE_NODE_MOBILE_CONNECTED
      </div>

    </main>
  );
}