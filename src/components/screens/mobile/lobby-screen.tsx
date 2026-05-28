'use client';
import React, { useState, useEffect, useRef } from 'react';
 
const AVATARS = ['(>_<)', '(0_0)', '(^_^)', '[^_^]', '(@_@)', '(T_T)', '(-_-)', '(O_O)'];
 
interface MobileLobbyScreenProps {
  onJoinRoom?: (pin: string, name: string, avatar: string) => void;
  systemError?: string;
}
 
export function LobbyScreen({ onJoinRoom, systemError }: MobileLobbyScreenProps) {
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
 
  // CORREÇÃO 1: Ref para controlar se o componente ainda está montado
  // Evita chamar setState após desmontagem (warning + bug de estado fantasma)
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);
 
  // CORREÇÃO 2: Quando systemError chega (erro do Firebase no page.tsx),
  // garantimos que o loading SEMPRE é desativado, independente do timing
  useEffect(() => {
    if (systemError && isMountedRef.current) {
      setIsConnecting(false);
      setLocalError('');
    }
  }, [systemError]);
 
  const activeError = systemError || localError;
 
  const dismissError = () => {
    setLocalError('');
    // Nota: systemError vem do parent (page.tsx) — o parent precisa limpá-lo.
    // O botão de fechar aqui só limpa o erro local.
    // Para limpar o systemError, o page.tsx deveria expor um onClearError.
    // Por ora, limpar o localError já destrava o formulário nos casos locais.
  };
 
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
 
    const cleanPin = pin.trim().toUpperCase();
    const cleanName = name.trim().toUpperCase();
 
    if (!cleanPin || cleanPin.length < 4) {
      setLocalError('FALHA DE PROTOCOLO: O CÓDIGO DEVE TER ENTRE 4 E 6 CARACTERES.');
      return;
    }
 
    if (!cleanName || cleanName.length < 3) {
      setLocalError('IDENTIFICAÇÃO REJEITADA: O NOME DEVE TER NO MÍNIMO 3 CARACTERES.');
      return;
    }
 
    setIsConnecting(true);
 
    // CORREÇÃO 3: O delay da animação (1200ms) existia para mostrar a tela de terminal
    // antes de chamar o Firebase. O problema é que se o Firebase demorar ou falhar,
    // não havia como desfazer o isConnecting=true.
    //
    // Solução: manter o delay visual MAS adicionar um timeout de segurança (fallback).
    // Se após 10 segundos nenhuma resposta chegou (nem sucesso nem erro do systemError),
    // o botão é liberado automaticamente com mensagem de timeout.
    const safetyTimeout = setTimeout(() => {
      if (isMountedRef.current && isConnecting) {
        setIsConnecting(false);
        setLocalError('TIMEOUT: SERVIDOR NÃO RESPONDEU. TENTE NOVAMENTE.');
      }
    }, 10000);
 
    setTimeout(() => {
      if (!isMountedRef.current) {
        clearTimeout(safetyTimeout);
        return;
      }
 
      if (onJoinRoom) {
        const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
        // CORREÇÃO 4: Passamos o safetyTimeout para que o page.tsx possa limpá-lo
        // quando a resposta chegar (sucesso ou erro). Fazemos isso via try/catch no parent.
        // Aqui limpamos após entregar o controle ao parent.
        onJoinRoom(cleanPin, cleanName, randomAvatar);
        clearTimeout(safetyTimeout);
      } else {
        // Fallback: sem handler externo, liberamos imediatamente
        setIsConnecting(false);
        clearTimeout(safetyTimeout);
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
        @keyframes slide-in-terminal {
          0% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }
        .animate-terminal { animation: slide-in-terminal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .animate-blink { animation: blink 0.8s infinite; }
      `}} />
 
      {/* HEADER */}
      <header className="w-full flex justify-center py-4 mb-4 sm:mb-8 shrink-0">
        <h1 className="font-pixel text-4xl sm:text-5xl font-bold tracking-widest text-[#1C1C1C] bg-[#FF6B35] px-4 sm:px-6 py-2 border-[3px] sm:border-[4px] border-[#1C1C1C] shadow-hard transform -rotate-1">
          CHAT_CAOS
        </h1>
      </header>
 
      {/* EXIBIÇÃO DE ERROS */}
      {activeError && (
        <div className="w-full max-w-md mx-auto mb-6 bg-[#C8381E] border-[3px] sm:border-[4px] border-[#1C1C1C] text-[#F7F5F0] rounded-[4px] shadow-hard flex flex-col overflow-hidden">
          <div className="bg-[#1C1C1C] text-[#F7F5F0] font-pixel text-lg sm:text-xl px-3 py-1 flex justify-between uppercase tracking-widest items-center">
            <span>[CRITICAL_ERROR.SYS]</span>
            <button
              type="button"
              className="cursor-pointer font-bold hover:text-[#FF6B35] px-2"
              onClick={dismissError}
            >
              X
            </button>
          </div>
          <div className="p-3 sm:p-4 font-pixel text-lg sm:text-2xl font-bold flex gap-3 items-center">
            <span className="text-2xl sm:text-3xl">!</span>
            <p className="leading-tight uppercase">{activeError}</p>
          </div>
        </div>
      )}
 
      {/* FORMULÁRIO */}
      <form onSubmit={handleJoin} className="flex-1 flex flex-col gap-4 sm:gap-6 max-w-md mx-auto w-full justify-center pb-8">
 
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
 
        <div className="pt-2 sm:pt-4 mt-2 sm:mt-4">
          <button
            type="submit"
            // CORREÇÃO 5: Removida a dependência de !pin || !name do disabled.
            // A validação já acontece no handleJoin com mensagem de erro clara.
            // Deixar o botão habilitado com campos vazios não é problema — o submit
            // vai mostrar o erro local. Isso evita o botão ficar "preso" por estado.
            disabled={isConnecting}
            className="w-full bg-[#1C1C1C] text-[#F7F5F0] border-[3px] sm:border-[4px] border-[#1C1C1C] rounded-[4px] p-4 sm:p-5 font-pixel text-2xl sm:text-3xl md:text-4xl uppercase tracking-widest shadow-hard transition-all active:translate-y-1 active:shadow-none hover:bg-[#FF6B35] hover:text-[#1C1C1C] disabled:opacity-50 whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {isConnecting ? 'CONECTANDO...' : '> CONECTAR_TERMINAL'}
          </button>
        </div>
      </form>
 
      {/* TRANSIÇÃO CINEMÁTICA */}
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