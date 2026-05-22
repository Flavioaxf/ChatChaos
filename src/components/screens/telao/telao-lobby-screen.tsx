'use client';
import React, { useState, useEffect } from 'react';

interface Player {
  id: string;
  name: string;
  avatar: string;
  score?: number;
  secretRole?: string;
}

interface TelaoLobbyScreenProps {
  roomCode: string;
  players: Player[];
  onStartGame: () => void;
}

export default function TelaoLobbyScreen({ roomCode, players, onStartGame }: TelaoLobbyScreenProps) {
  const [dots, setDots] = useState('');
  const [phase, setPhase] = useState(0); 
  const [fakePlayerCount, setFakePlayerCount] = useState(players.length);
  
  // Códigos de erro falsos para o Kernel Panic (Fase 5)
  const [dumpLogs, setDumpLogs] = useState<string[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Contador de jogadores falsos disparando (Fases 2 a 4)
  useEffect(() => {
    let spamInterval: NodeJS.Timeout;
    if (phase >= 2 && phase < 5) {
      spamInterval = setInterval(() => {
        setFakePlayerCount(prev => prev + Math.floor(Math.random() * 47) + 13);
      }, 50);
    }
    return () => clearInterval(spamInterval);
  }, [phase]);

  // Gera logs hexadecimais aleatórios para o Kernel Panic
  useEffect(() => {
    if (phase === 5) {
      const logs = Array.from({ length: 60 }).map(() => {
        const hex1 = Math.random().toString(16).substr(2, 8).toUpperCase();
        const hex2 = Math.random().toString(16).substr(2, 8).toUpperCase();
        return `FATAL_EXC_0x${hex1} : SEG_FAULT_AT_ADDR_0x${hex2} ... CORE_DUMPING`;
      });
      setDumpLogs(logs);
    }
  }, [phase]);

  const handleStartCaos = () => {
    setPhase(1); // FASE 1: Tentando conectar
    
    setTimeout(() => setPhase(2), 1500); // FASE 2: Conexão falha, detecta sobrecarga
    setTimeout(() => setPhase(3), 3000); // FASE 3: Nós da rede começam a dar erro
    setTimeout(() => setPhase(4), 4500); // FASE 4: Painel principal sucumbe (vermelho)
    setTimeout(() => setPhase(5), 6000); // FASE 5: Kernel Panic (Tela vomita códigos)
    setTimeout(() => setPhase(6), 6800); // FASE 6: CRT Power Off (Desliga o monitor)
    setTimeout(() => onStartGame(), 7300); // FINAL: Vai pra tela de Contexto
  };

  const maxSlots = Math.max(8, players.length + (4 - (players.length % 4)));
  const emptySlotsCount = maxSlots - players.length;

  return (
    // O fundo raiz agora é preto para o efeito da TV desligando ficar perfeito
    <div className="flex-1 flex flex-col h-screen max-h-screen bg-[#1C1C1C] overflow-hidden selection:bg-[#FF6B35] selection:text-[#F7F5F0]">
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        .font-pixel { font-family: 'VT323', monospace !important; }

        @keyframes critical-flash {
          0%, 100% { background-color: #C8381E; }
          50% { background-color: #F7F5F0; }
        }
        .animate-critical-flash { animation: critical-flash 0.15s infinite; }
        
        @keyframes panic-shake {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-4px, 4px); }
          50% { transform: translate(4px, -2px); }
          75% { transform: translate(-2px, -4px); }
        }
        .animate-panic { animation: panic-shake 0.2s infinite; }

        /* A TELA VOMITANDO CÓDIGO (KERNEL PANIC) */
        @keyframes scroll-dump {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-scroll-dump { animation: scroll-dump 0.8s linear forwards; }

        /* A TV SENDO DESLIGADA (CRT OFF) */
        @keyframes crt-off {
          0% { transform: scale(1, 1); opacity: 1; }
          30% { transform: scale(1, 0.01); opacity: 1; background-color: #FFFFFF; filter: brightness(2); }
          70% { transform: scale(0.005, 0.01); opacity: 1; background-color: #FFFFFF; filter: brightness(2); }
          100% { transform: scale(0, 0); opacity: 0; }
        }
        .animate-crt-off { 
          animation: crt-off 0.4s ease-out forwards; 
          transform-origin: center center; 
        }
      `}} />

      {/* O CONTAINER DA INTERFACE INTEIRA (É isso aqui que "desliga" como uma TV no final) */}
      <div className={`flex-1 flex flex-col w-full h-full relative transition-colors duration-300 ${phase >= 6 ? 'animate-crt-off' : phase >= 4 ? 'bg-[#C8381E] animate-critical-flash' : 'bg-[#F7F5F0]'} p-2 md:p-4`}>

        {/* FASE 5: O KERNEL PANIC COBRINDO TUDO */}
        {phase === 5 && (
          <div className="absolute inset-0 z-[100] bg-[#C8381E] text-[#F7F5F0] font-pixel text-lg md:text-xl p-4 overflow-hidden flex flex-col leading-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
            <div className="animate-scroll-dump flex flex-col gap-1 opacity-80">
              {dumpLogs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#F7F5F0] text-[#C8381E] text-4xl md:text-6xl p-4 font-bold animate-pulse text-center whitespace-nowrap">
              PHYSICAL_MEMORY_DUMP
            </div>
          </div>
        )}

        <div className={`flex-1 border-[4px] border-[#1C1C1C] rounded-[8px] flex flex-col overflow-hidden relative shadow-[8px_8px_0px_#1C1C1C] transition-colors duration-300 ${phase >= 4 ? 'bg-[#C8381E] shadow-none' : 'bg-[#EDEBE5]'}`}>
          
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0" 
               style={{ backgroundImage: 'radial-gradient(#1C1C1C 2px, transparent 2px)', backgroundSize: '24px 24px' }}>
          </div>

          {/* BARRA SUPERIOR */}
          <div className="bg-[#1C1C1C] text-[#F7F5F0] p-2 md:p-3 flex justify-between items-center border-b-[4px] border-[#1C1C1C] z-10 transition-all duration-[600ms]">
            <div className="flex items-center gap-4 font-pixel text-base md:text-xl tracking-widest">
              <span className={`flex items-center gap-2 ${phase >= 2 ? 'text-[#C8381E] animate-pulse' : 'text-[#FF6B35]'}`}>
                <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${phase >= 2 ? 'bg-[#C8381E] animate-none' : 'bg-[#FF6B35] animate-ping'}`}></div>
                {phase >= 2 ? 'ANOMALY_DETECTED' : 'NETWORK_LOBBY_ACTIVE'}
              </span>
              <span className="hidden md:inline border-l-2 border-[#333] pl-4 text-[#888888]">
                {phase >= 2 ? 'MULTIPLE_REQUESTS_SPIKE!!!' : `AWAITING_NODES${dots}`}
              </span>
            </div>
            <div className={`font-pixel text-base md:text-lg tracking-widest px-3 py-1 font-bold ${phase >= 2 ? 'bg-[#C8381E] text-[#F7F5F0] animate-panic' : 'bg-[#FF6B35] text-[#1C1C1C]'}`}>
              PLAYERS_CONNECTED: {fakePlayerCount}
            </div>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row overflow-visible z-10 relative">
            
            {/* COLUNA ESQUERDA (O FAROL) */}
            <div className={`lg:w-2/5 border-b-[4px] lg:border-b-0 lg:border-r-[4px] border-[#1C1C1C] p-4 md:p-8 flex flex-col h-full overflow-y-auto ${phase >= 4 ? 'bg-[#C8381E] animate-panic' : 'bg-[#F7F5F0]'}`}>
              
              <div>
                <div className={`inline-block border-[4px] border-[#1C1C1C] px-3 py-1 font-pixel text-lg md:text-xl tracking-widest uppercase mb-4 ${phase >= 4 ? 'bg-[#F7F5F0] text-[#C8381E] shadow-none' : 'bg-[#1C1C1C] text-[#F7F5F0] shadow-[4px_4px_0px_#FF6B35]'}`}>
                  // ACCESS_PROTOCOL
                </div>
                
                <h2 className={`font-pixel text-[clamp(1.8rem,4vw,2.5rem)] uppercase leading-none mb-4 border-l-[6px] pl-4 tracking-widest ${phase >= 4 ? 'border-[#1C1C1C] text-[#F7F5F0]' : 'border-[#FF6B35] text-[#1C1C1C]'}`}>
                  {phase >= 4 ? 'SISTEMA_COMPROMETIDO_ FALHA_GERAL' : 'Acesse o terminal mobile para ingressar na sessão.'}
                </h2>
                
                <p className={`font-pixel text-[clamp(1.2rem,2vw,1.8rem)] mb-6 leading-tight ${phase >= 4 ? 'text-[#1C1C1C]' : 'text-[#888]'}`}>
                  {phase >= 4 ? 'A TENTATIVA DE CONEXÃO CAUSOU UMA SOBRECARGA CRÍTICA. ACESSO NEGADO.' : (
                    <>Acesse <strong className="text-[#1C1C1C] underline decoration-[3px] decoration-[#FF6B35] tracking-widest">caos.chat</strong> no seu dispositivo e insira a chave de criptografia abaixo:</>
                  )}
                </p>
              </div>

              <div className="flex flex-col items-center my-auto">
                <div className={`w-full border-[4px] border-[#1C1C1C] p-4 md:p-6 rounded-[8px] relative overflow-hidden flex flex-col items-center justify-center ${phase >= 4 ? 'bg-[#C8381E] shadow-none animate-pulse' : 'bg-[#1C1C1C] shadow-[8px_8px_0px_#FF6B35]'}`}>
                  <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, #000 4px, #000 8px)' }}></div>
                  
                  <span className={`font-pixel text-lg md:text-xl tracking-widest mb-1 z-10 ${phase >= 4 ? 'text-[#1C1C1C] font-bold' : 'text-[#888888]'}`}>
                    SESSION_HASH:
                  </span>
                  
                  <span className={`font-pixel text-[clamp(2.5rem,7vw,6rem)] leading-none tracking-widest z-10 w-full text-center whitespace-nowrap ${phase >= 4 ? 'text-[#1C1C1C]' : 'text-[#F7F5F0]'}`} style={{ textShadow: phase >= 4 ? 'none' : '4px 4px 0px #FF6B35' }}>
                    {phase >= 4 ? '0xOVERLOAD' : roomCode}
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-6">
                <button
                  onClick={handleStartCaos}
                  disabled={players.length < 2 || phase > 0}
                  className={`w-full py-4 md:py-5 text-[clamp(1.2rem,2.5vw,2.5rem)] font-pixel font-bold rounded-[8px] border-[4px] border-[#1C1C1C] border-b-[8px] transition-all tracking-widest uppercase flex items-center justify-center gap-4
                    ${players.length >= 2 && phase === 0
                      ? 'bg-[#FF6B35] text-[#1C1C1C] hover:bg-[#e05a2b] active:border-b-[4px] active:translate-y-[4px]' 
                      : phase >= 4
                      ? 'bg-[#1C1C1C] text-[#C8381E] border-b-[4px] translate-y-[4px] animate-panic'
                      : phase >= 1
                      ? 'bg-[#1C1C1C] text-[#F7F5F0] border-b-[4px] translate-y-[4px]'
                      : 'bg-[#D0CEC8] text-[#888888] cursor-not-allowed border-[#888888]'
                    }`}
                >
                  {phase === 1 ? (
                    <span className="animate-pulse">[ ESTABELECENDO_CONEXÃO... ]</span>
                  ) : phase === 2 ? (
                    <span className="text-[#C8381E]">[ ERR_TIMEOUT ]</span>
                  ) : phase === 3 ? (
                    <span className="text-[#FF6B35]">[ MULTIPLE_ACCESS_DETECTED ]</span>
                  ) : phase >= 4 ? (
                    <span className="text-[#C8381E]">&gt;&gt;&gt; FALHA_CRÍTICA_</span>
                  ) : players.length >= 2 ? (
                    <>
                      <span className="animate-pulse">&gt;&gt;&gt;</span> INICIAR_CAOS_
                    </>
                  ) : (
                    <>WAITING_PLAYERS_</>
                  )}
                </button>
              </div>
              
            </div>

            {/* COLUNA DIREITA: GRID DE JOGADORES */}
            <div className={`lg:w-3/5 p-4 md:p-8 flex flex-col overflow-y-auto relative ${phase >= 3 ? 'bg-[#F7F5F0] animate-panic' : 'bg-[#EDEBE5]'}`}>
              
              <div className="hidden sm:flex gap-6 text-xs lg:text-sm font-pixel font-bold tracking-widest z-20 mb-6 text-[#1C1C1C]">
                <div className="flex flex-col gap-1">
                  <span>CPU_LOAD</span>
                  <div className="flex gap-1 h-3 items-end">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={`w-2 ${phase >= 3 ? 'bg-[#C8381E] h-full animate-pulse' : i < 2 ? 'bg-[#FF6B35] h-full' : 'bg-[#D0CEC8] h-1'}`}></div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span>MEMORY_ALLOC</span>
                  <div className="flex gap-1 h-3 items-end">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={`w-2 ${phase >= 3 ? 'bg-[#C8381E] h-full animate-pulse' : i < 4 ? 'bg-[#1C1C1C] h-full' : 'bg-[#D0CEC8] h-1'}`}></div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end mb-6 border-b-[4px] border-dashed border-[#1C1C1C] pb-2 z-10">
                 <h3 className="font-pixel text-[clamp(1.5rem,3vw,2.5rem)] tracking-widest text-[#1C1C1C] leading-none">CONNECTED_NODES</h3>
                 <span className={`font-pixel text-lg md:text-xl tracking-widest leading-none ${phase >= 3 ? 'text-[#C8381E] animate-pulse' : 'text-[#FF6B35]'}`}>
                   CAPACITY: {fakePlayerCount}/12
                 </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5 z-10">
                
                {players.map((player) => (
                  <div key={player.id} className={`bg-[#F7F5F0] border-[4px] border-[#1C1C1C] border-b-[6px] rounded-[4px] p-3 flex flex-col items-center justify-center relative overflow-hidden transition-all ${phase >= 3 ? 'border-[#C8381E] shadow-none bg-[#C8381E]' : 'shadow-[4px_4px_0px_#1C1C1C]'}`}>
                    <div className={`absolute top-0 left-0 w-full h-1 ${phase >= 3 ? 'bg-[#1C1C1C]' : 'bg-[#FF6B35]'}`}></div>
                    
                    <div className={`text-4xl md:text-5xl mb-2 mt-2 font-pixel ${phase >= 3 ? 'text-[#F7F5F0] animate-ping' : 'text-[#1C1C1C]'}`}>
                      {phase >= 3 ? '(!)' : player.avatar}
                    </div>
                    
                    <div className={`w-full text-center py-1 font-pixel text-base md:text-lg tracking-widest truncate px-2 ${phase >= 3 ? 'bg-[#F7F5F0] text-[#C8381E]' : 'bg-[#1C1C1C] text-[#F7F5F0]'}`}>
                      {phase >= 3 ? 'UNKNOWN_NODE' : player.name}
                    </div>
                    
                    <div className={`mt-2 text-xs font-pixel tracking-widest ${phase >= 3 ? 'text-[#1C1C1C] font-bold' : 'text-[#888888]'}`}>
                      {phase >= 3 ? `ERR_0x${Math.floor(Math.random() * 9999)}` : `ID: ${player.id.substring(0,6)}..`}
                    </div>
                  </div>
                ))}

                {Array.from({ length: emptySlotsCount }).map((_, i) => (
                  <div key={`empty-${i}`} className={`border-[4px] border-dashed rounded-[4px] p-3 flex flex-col items-center justify-center ${phase >= 3 ? 'border-[#C8381E] bg-[#C8381E] opacity-100' : 'border-[#D0CEC8] bg-transparent opacity-60'}`}>
                    <div className={`text-4xl mb-2 font-pixel ${phase >= 3 ? 'text-[#F7F5F0]' : 'text-[#D0CEC8]'}`}>
                      {phase >= 3 ? '(!)' : '(?)'}
                    </div>
                    <div className={`w-full text-center py-1 font-pixel text-base md:text-lg tracking-widest truncate px-1 ${phase >= 3 ? 'bg-[#F7F5F0] text-[#C8381E]' : 'bg-[#D0CEC8] text-[#EDEBE5]'}`}>
                      {phase >= 3 ? 'BREACH' : 'EMPTY_SLOT'}
                    </div>
                    <div className={`mt-2 text-xs font-pixel tracking-widest ${phase >= 3 ? 'text-[#1C1C1C] font-bold' : 'text-[#888888] opacity-0'}`}>
                      {phase >= 3 ? 'ERR_NULL' : 'ID: UNKNOWN'}
                    </div>
                  </div>
                ))}

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}