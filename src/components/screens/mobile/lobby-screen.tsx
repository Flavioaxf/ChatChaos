'use client';
import React, { useState, useEffect } from 'react';

const AVATARS = ['(>_<)', '(0_0)', '(^_^)', '[^_^]', '(@_@)', '(T_T)', '(-_-)', '(O_O)'];

interface MobileLobbyScreenProps {
  onJoinRoom?: (pin: string, name: string, avatar: string) => void;
  systemError?: string; // Erros vindos da integração (ex: "Sala não existe")
}

export function LobbyScreen({ onJoinRoom, systemError }: MobileLobbyScreenProps) {
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Se o Firebase retornar um erro (ex: PIN errado), desativamos o loading e mostramos o erro
  useEffect(() => {
    if (systemError) {
      setIsConnecting(false);
      setLocalError(''); // Limpa o erro local para dar preferência ao erro do sistema
    }
  }, [systemError]);

  const activeError = systemError || localError;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    const cleanPin = pin.trim().toUpperCase();
    const cleanName = name.trim().toUpperCase();

    // Validações Personalizadas Locais
    if (!cleanPin || cleanPin.length < 4) {
      setLocalError('FALHA DE PROTOCOLO: O CÓDIGO (PIN) DEVE TER ENTRE 4 E 6 CARACTERES.');
      return;
    }
    
    if (!cleanName || cleanName.length < 3) {
      setLocalError('IDENTIFICAÇÃO REJEITADA: O NOME DEVE TER NO MÍNIMO 3 CARACTERES.');
      return;
    }

    // Inicia a transição visual
    setIsConnecting(true);

    // Pequeno delay para a animação do terminal aparecer antes de enviar os dados
    setTimeout(() => {
      if (onJoinRoom) {
        // Sorteia o avatar de forma automática no momento do login
        const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
        onJoinRoom(cleanPin, cleanName, randomAvatar);
      } else {
        // Fallback de segurança caso a função não seja passada
        setIsConnecting(false);
      }
    }, 1200);
  };

  return (
    <main className="min-h-screen w-full bg-[#EDEBE5] text-[#1C1C1C] flex flex-col font-sans p-4 sm:p-6 relative overflow-hidden select-none">
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=VT323&display=swap');
        .font-pixel { font-family: 'VT323', monospace !important; }
        .font-sans { font-family: 'DM Sans', sans-serif !important; }
        
        .shadow-hard { box-shadow: 4px 4px 0px #1C1C1C; }
        @media (min-width: 640px) {
          .shadow-hard { box-shadow: 6px 6px 0px #1C1C1C; }
        }

        /* Animações de transição de tela */
        @keyframes slide-in-terminal {
          0% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }
        .animate-terminal { animation: slide-in-terminal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .animate-blink { animation: blink 0.8s infinite; }
      `}} />

      {/* HEADER: Identidade Visual */}
      <header className="w-full flex justify-center py-4 mb-4 sm:mb-8 shrink-0">
        <h1 className="font-pixel text-4xl sm:text-5xl font-bold tracking-widest text-[#1C1C1C] bg-[#FF6B35] px-4 sm:px-6 py-2 border-[3px] sm:border-[4px] border-[#1C1C1C] shadow-hard transform -rotate-1">
          CHAT_CAOS
        </h1>
      </header>

      {/* EXIBIÇÃO DE ERROS RETRO / BRUTALISTA (Totalmente Responsivo) */}
      {activeError && (
        <div className="w-full max-w-md mx-auto mb-6 bg-[#C8381E] border-[3px] sm:border-[4px] border-[#1C1C1C] text-[#F7F5F0] rounded-[4px] shadow-hard animate-fade-in flex flex-col overflow-hidden">
          <div className="bg-[#1C1C1C] text-[#F7F5F0] font-pixel text-lg sm:text-xl px-3 py-1 flex justify-between uppercase tracking-widest items-center">
            <span>[CRITICAL_ERROR.SYS]</span>
            <button 
              type="button" 
              className="cursor-pointer font-bold hover:text-[#FF6B35] px-2" 
              onClick={() => { setLocalError(''); /* Avisar parent para limpar systemError se aplicável */ }}
            >
              X
            </button>
          </div>
          <div className="p-3 sm:p-4 font-pixel text-lg sm:text-2xl font-bold flex gap-3 items-center">
            <span className="text-2xl sm:text-3xl">⚠</span>
            <p className="leading-tight uppercase">{activeError}</p>
          </div>
        </div>
      )}

      {/* FORMULÁRIO PRINCIPAL */}
      <form onSubmit={handleJoin} className="flex-1 flex flex-col gap-4 sm:gap-6 max-w-md mx-auto w-full justify-center pb-8">
        
        {/* INPUT: Código da Sala (PIN) */}
        <div className="flex flex-col gap-1 sm:gap-2">
          <label htmlFor="pin" className="font-pixel text-xl sm:text-2xl uppercase font-bold tracking-widest text-[#1C1C1C]">
            CÓDIGO DA SALA:
          </label>
          <input
            id="pin"
            type="text"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.toUpperCase())}
            placeholder="EX: A1B2"
            disabled={isConnecting}
            required
            className="w-full bg-[#F7F5F0] border-[3px] sm:border-[4px] border-[#1C1C1C] rounded-[4px] p-3 sm:p-4 font-pixel text-2xl sm:text-4xl text-center uppercase outline-none focus:shadow-hard transition-shadow placeholder:text-[#AAA] disabled:opacity-60"
          />
        </div>

        {/* INPUT: Nome do Agente */}
        <div className="flex flex-col gap-1 sm:gap-2">
          <label htmlFor="name" className="font-pixel text-xl sm:text-2xl uppercase font-bold tracking-widest text-[#1C1C1C]">
            IDENTIFICAÇÃO:
          </label>
          <input
            id="name"
            type="text"
            maxLength={12}
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            placeholder="NOME DO AGENTE"
            disabled={isConnecting}
            required
            className="w-full bg-[#F7F5F0] border-[3px] sm:border-[4px] border-[#1C1C1C] rounded-[4px] p-3 sm:p-4 font-pixel text-2xl sm:text-3xl uppercase outline-none focus:shadow-hard transition-shadow placeholder:text-[#AAA] disabled:opacity-60"
          />
        </div>

        {/* BOTÃO DE ENVIO (Agora com whitespace-nowrap e text responsivo) */}
        <div className="pt-2 sm:pt-4 mt-2 sm:mt-4">
          <button
            type="submit"
            disabled={isConnecting || !pin || !name}
            className="w-full bg-[#1C1C1C] text-[#F7F5F0] border-[3px] sm:border-[4px] border-[#1C1C1C] rounded-[4px] p-4 sm:p-5 font-pixel text-2xl sm:text-3xl md:text-4xl uppercase tracking-widest shadow-hard transition-all active:translate-y-1 active:shadow-none hover:bg-[#FF6B35] hover:text-[#1C1C1C] disabled:opacity-50 whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {isConnecting ? 'CONECTANDO...' : '> CONECTAR_TERMINAL'}
          </button>
        </div>
      </form>

      {/* =========================================================================
          TRANSICÃO CINEMÁTICA DE SISTEMA (SOBREPOSIÇÃO)
          ========================================================================= */}
      {isConnecting && !activeError && (
        <div className="absolute inset-0 bg-[#1C1C1C] z-50 flex flex-col justify-end p-6 sm:p-8 animate-terminal">
          <div className="w-full font-pixel text-[#FF6B35] text-2xl sm:text-3xl leading-relaxed space-y-3 sm:space-y-4">
            <p>&gt; INICIANDO CONEXÃO CLIENT-SIDE...</p>
            <p className="truncate">&gt; VALIDANDO CREDENCIAIS: <span className="text-[#F7F5F0]">"{name}"</span></p>
            <p className="truncate">&gt; ACESSANDO HOST: <span className="text-[#F7F5F0]">"{pin}"</span></p>
            <div className="flex gap-2 items-center text-[#06D6A0] pt-4 border-t border-[#333] mt-4">
              <span className="truncate">&gt; SINCRONIZANDO</span>
              <span className="w-3 h-5 sm:h-6 bg-[#06D6A0] animate-blink shrink-0"></span>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}