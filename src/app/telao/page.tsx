'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import { useRoom } from '@/src/hooks/useRoom';
import { useRouter } from 'next/navigation';

const MOCK_LOGS = [
  "INIT_SEQ_0x00A1... OK",
  "LOADING_MODULES... OK",
  "CONNECTING_PEERS.. OK",
  "ESTABLISHING_SECURE_LINE...",
  "NO_EMOJI_PROTOCOL_ENFORCED...",
  "AWAITING_HANDSHAKE...",
  "PING 192.168.0.104... 23ms",
  "INCOMING_REQUEST: POST /api/room",
  "ALLOCATING_MEMORY_BLOCK...",
  "SYS.WARN: OVERLOAD_DETECTED",
  "REROUTING_TRAFFIC_TO_NODE_B...",
  "TCP_CONNECTION_ESTABLISHED",
  "FETCHING_USER_PAYLOAD...",
  "DECRYPTING_PACKET_DATA...",
  "AUTH_TOKEN_VALIDATED_SUCCESS",
];

export default function TelaoMenuPage() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    // Define a hora inicial assim que o componente montar
    setTime(new Date().toLocaleTimeString());

    // Atualiza a cada segundo
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const router = useRouter();
  const { user } = useAuth();
  const { createRoom } = useRoom();
  const [loading, setLoading] = useState(false);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [cpuLoad, setCpuLoad] = useState(12);
  const [showTutorial, setShowTutorial] = useState(false);
  
  
  // ESTADOS ADICIONADOS APENAS PARA A TRANSIÇÃO
  const [bootStep, setBootStep] = useState(-1);

  const criarNovaSala = async () => {
    if (!user) return; // Garante que o host está autenticado anonimamente
    
    setLoading(true);
    setCpuLoad(100); 
    setBootStep(0); 
    
    try {
      // 1. O Backend cria a sala PRIMEIRO e gera o código
      const newRoomCode = await createRoom(user.uid);

      // 2. A coreografia original de animação prossegue intocável
      setTimeout(() => setBootStep(1), 100);
      setTimeout(() => setBootStep(2), 1000);
      setTimeout(() => setBootStep(3), 1600);
      setTimeout(() => setBootStep(4), 2200);
      setTimeout(() => setBootStep(5), 2800);
      
      // 3. Redirecionamos para a sala REAL gerada pelo Firebase (em vez de 'CAOS2026')
      setTimeout(() => {
        router.push(`/telao/${newRoomCode}`);
      }, 3400); 

    } catch (error) {
      console.error("Erro crítico ao instanciar servidor:", error);
      setLoading(false);
      setBootStep(-1);
    }
  };

  useEffect(() => {
    setSystemLogs(["SYS.BOOT // MAIN_NODE", "AWAITING_CONNECTIONS..."]);

    const interval = setInterval(() => {
      if (!loading) {
        setSystemLogs(prevLogs => {
          const randomLog = MOCK_LOGS[Math.floor(Math.random() * MOCK_LOGS.length)];
          const timestamp = new Date().toISOString().substring(11, 19);
          const newLog = `[${timestamp}] ${randomLog}`;
          
          const updatedLogs = [...prevLogs, newLog];
          if (updatedLogs.length > 30) updatedLogs.shift(); 
          return updatedLogs;
        });
        setCpuLoad(Math.floor(Math.random() * 40) + 10);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [loading]);

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#F7F5F0] text-[#1C1C1C] p-2 md:p-4 font-sans selection:bg-[#FF6B35] selection:text-[#F7F5F0] flex flex-col relative">
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        .font-pixel { font-family: 'VT323', monospace; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}} />

      <div className="flex-1 border-[4px] border-[#1C1C1C] rounded-[8px] flex flex-col overflow-hidden max-h-full">
        
        <div className="bg-[#1C1C1C] text-[#F7F5F0] p-2 md:p-3 flex justify-between items-center text-xs md:text-sm font-pixel tracking-widest border-b-[4px] border-[#1C1C1C]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 font-bold text-base">
              <div className="w-3 h-3 bg-[#FF6B35] rounded-full animate-ping"></div>
              HOST_TERMINAL_ONLINE
            </span>
            <span className="hidden md:inline border-l-2 border-[#888888] pl-4 opacity-70 text-base">
              PORT: 3000 // PROTOCOL: SECURE
            </span>
          </div>
          <div className="flex items-center gap-2 opacity-70 text-base">
            <span>SYS_TIME: {time}</span>s
          </div>
        </div>

        {/* Adicionado 'relative' aqui para o overlay ficar contido nesta área */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          <div className="hidden md:flex flex-col bg-[#1C1C1C] border-r-[4px] border-[#1C1C1C] flex-shrink-0 md:w-[320px] lg:w-[400px]">
            <div className="bg-[#FF6B35] text-[#1C1C1C] p-3 text-lg font-pixel font-bold tracking-widest uppercase border-b-[4px] border-[#1C1C1C] flex justify-between">
              <span>SERVER_ACTIVITY.LOG</span>
              <span className="animate-pulse">[REC]</span>
            </div>
            
            <div className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col justify-end">
              <div className="flex flex-col gap-1 font-pixel text-lg text-[#FF6B35] tracking-widest">
                {systemLogs.map((log, index) => (
                  <div key={index} className="opacity-80 hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden text-ellipsis">
                    {log}
                  </div>
                ))}
                <div className="animate-pulse w-3 h-5 bg-[#FF6B35] mt-1" />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0 bg-[#EDEBE5] relative flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden">
            
            <div className="absolute inset-0 opacity-[0.08] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#1C1C1C 3px, transparent 3px)', backgroundSize: '36px 36px' }}>
            </div>

            <div className="absolute top-4 left-6 flex gap-6 text-xs lg:text-base font-pixel font-bold text-[#888888] tracking-widest hidden sm:flex">
              <div className="flex flex-col gap-1">
                <span>CPU_LOAD</span>
                <div className="flex gap-1 h-4 items-end">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className={`w-2 lg:w-3 ${i < (cpuLoad / 10) ? 'bg-[#FF6B35] h-full' : 'bg-[#D0CEC8] h-1'}`}></div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span>MEMORY_ALLOC</span>
                <div className="flex gap-1 h-4 items-end">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className={`w-2 lg:w-3 ${i < 4 ? 'bg-[#1C1C1C] h-full' : 'bg-[#D0CEC8] h-1'}`}></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative z-10 w-full max-w-[90%] md:max-w-xl lg:max-w-2xl xl:max-w-3xl bg-[#F7F5F0] border-[4px] border-b-[12px] lg:border-b-[16px] border-r-[12px] lg:border-r-[16px] border-[#1C1C1C] rounded-[8px] flex flex-col shadow-2xl mt-8">
              
              <div className="bg-[#1C1C1C] text-[#F7F5F0] p-2 md:p-3 flex justify-between items-center text-sm font-pixel tracking-widest uppercase border-b-[4px] border-[#1C1C1C]">
                <span>// AUTH_MODULE_v2.0</span>
                <span className="text-[#FF6B35] animate-pulse">RESTRICTED_ACCESS</span>
              </div>

              <div className="p-4 md:p-6 lg:p-8 bg-[#1C1C1C] m-4 border-[4px] md:border-[6px] border-[#333333] relative overflow-hidden rounded-[4px] flex justify-center items-center">
                 <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, #000 3px, #000 6px)' }}></div>
                 
                 <h1 className="text-[clamp(2.5rem,6vw,6.5rem)] font-pixel text-[#FF6B35] tracking-widest leading-none text-center relative z-10 whitespace-nowrap uppercase" style={{ textShadow: '4px 4px 0px rgba(255,107,53,0.3)' }}>
                   CHAT_CAOS<span className="animate-pulse text-[#F7F5F0]">_</span>
                 </h1>
              </div>

              <div className="px-6 lg:px-10 pb-6 lg:pb-8 text-center flex flex-col gap-4 lg:gap-5">
                
                <button
                  onClick={criarNovaSala}
                  disabled={loading}
                  className={`w-full py-4 lg:py-5 text-[clamp(1.25rem,3vw,2.5rem)] font-pixel font-bold rounded-[8px] border-[4px] border-[#1C1C1C] border-b-[8px] lg:border-b-[12px] transition-all tracking-widest uppercase relative overflow-hidden group
                    ${loading 
                      ? 'bg-[#1C1C1C] text-[#FF6B35] border-b-[4px] translate-y-[4px]' 
                      : 'bg-[#FF6B35] text-[#1C1C1C] hover:bg-[#e05a2b] active:border-b-[4px] active:translate-y-[4px] lg:active:translate-y-[8px]'
                    }`}
                >
                  <span className={loading ? 'opacity-0' : 'opacity-100'}>
                    {">>> INICIALIZAR_SISTEMA_"}
                  </span>
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="animate-pulse">[ BOOTING_SERVER... ]</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setShowTutorial(true)}
                  disabled={loading}
                  className="w-full py-3 lg:py-4 text-lg lg:text-2xl font-pixel font-bold rounded-[8px] border-[4px] border-[#1C1C1C] border-b-[6px] bg-[#D0CEC8] text-[#1C1C1C] hover:bg-[#b8b6b0] active:border-b-[4px] active:translate-y-[2px] transition-all tracking-widest uppercase flex justify-center items-center gap-3"
                >
                  <span className="bg-[#1C1C1C] text-[#D0CEC8] px-3 py-1 text-base lg:text-lg rounded-[4px]">?</span> LER_MANUAL.TXT
                </button>

                <div className="pt-2 lg:pt-4 border-t-[4px] border-dashed border-[#D0CEC8] flex justify-between items-center opacity-50 mt-2">
                  <div className="flex gap-[3px] h-4 lg:h-6 items-center">
                    <div className="w-1.5 h-full bg-[#1C1C1C]"></div>
                    <div className="w-3 h-full bg-[#1C1C1C]"></div>
                    <div className="w-[3px] h-full bg-[#1C1C1C]"></div>
                    <div className="w-1.5 h-full bg-[#1C1C1C]"></div>
                    <div className="w-4 h-full bg-[#1C1C1C]"></div>
                    <div className="w-[3px] h-full bg-[#1C1C1C]"></div>
                    <div className="w-1.5 h-full bg-[#1C1C1C]"></div>
                  </div>
                  <div className="text-sm lg:text-lg font-pixel tracking-widest font-bold">SN: CAOS-9982-X</div>
                </div>
              </div>
            </div>
            
          </div>

          {/* ========================================================= */}
          {/* TRANSIÇÃO 1: TERMINAL EXPANDINDO DA ESQUERDA PARA A DIREITA */}
          {/* ========================================================= */}
          <div 
            className={`absolute top-0 left-0 h-full bg-[#1C1C1C] z-[100] flex flex-col justify-center p-6 md:p-12 transition-all duration-[800ms] ease-[cubic-bezier(0.85,0,0.15,1)] border-r-[4px] md:border-r-[8px] border-[#FF6B35] overflow-hidden whitespace-nowrap
            ${bootStep >= 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            ${bootStep >= 1 ? 'w-full' : 'w-[0px] md:w-[320px] lg:w-[400px]'}`}
          >
            <div className="flex justify-between items-center border-b-[4px] border-[#333] pb-4 mb-12 opacity-80 min-w-[600px]">
              <span className="font-pixel text-xl md:text-3xl text-[#888888] tracking-widest">SYS.OVERRIDE_SEQUENCE</span>
              <span className="font-pixel text-xl md:text-3xl text-[#FF6B35] animate-pulse tracking-widest">AUTH_BYPASS_ACTIVE</span>
            </div>

            <div className="font-pixel text-[clamp(1rem,3vw,2.5rem)] text-[#FF6B35] flex flex-col gap-6 leading-none tracking-widest mt-8 min-w-[600px]">
               {bootStep >= 2 && <p className="animate-fade-in">&gt; FORCING_SECURE_HANDSHAKE... <span className="text-[#F7F5F0]">OK</span></p>}
               {bootStep >= 3 && <p className="animate-fade-in">&gt; GENERATING_ROOM_HASH: CAOS-2026... <span className="text-[#F7F5F0]">OK</span></p>}
               {bootStep >= 4 && <p className="animate-fade-in">&gt; ROUTING_TO_LOBBY_MAINFRAME... <span className="animate-pulse">_</span></p>}
            </div>
          </div>

        </div>
      </div>

      {/* MODAL POP-UP DO MANUAL DE INSTRUÇÕES */}
      {showTutorial && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-4xl bg-[#F7F5F0] border-[4px] border-[#1C1C1C] rounded-[8px] shadow-[16px_16px_0px_rgba(255,107,53,1)] flex flex-col max-h-full">
            <div className="bg-[#1C1C1C] text-[#F7F5F0] p-4 flex justify-between items-center border-b-[4px] border-[#1C1C1C]">
              <span className="font-pixel tracking-widest text-lg md:text-xl">C:\DOCS\MANUAL_DE_SOBREVIVENCIA.TXT</span>
              <button onClick={() => setShowTutorial(false)} className="bg-[#C8381E] text-[#F7F5F0] px-4 py-2 text-lg font-pixel font-bold border-[2px] border-[#C8381E] hover:bg-transparent hover:text-[#C8381E] transition-colors">[X] FECHAR</button>
            </div>
            <div className="p-6 md:p-10 font-sans text-[#1C1C1C] overflow-y-auto">
              <p className="text-[#1C1C1C] text-xl font-medium leading-relaxed font-sans mb-10 border-l-[6px] border-[#FF6B35] pl-6 text-left">Transforme o chat colaborativo da equipe em uma arena de modificações imprevisíveis. Inicialize o módulo central para gerar as chaves de acesso.</p>
              <h2 className="text-4xl md:text-5xl font-pixel text-[#FF6B35] mb-8 uppercase border-b-[4px] border-dashed border-[#D0CEC8] pb-4 tracking-wider">COMO SOBREVIVER AO SISTEMA:</h2>
              <div className="space-y-8 text-lg md:text-xl">
                <div className="flex gap-6"><span className="text-4xl font-pixel text-[#FF6B35] mt-1">01_</span><div><strong className="block uppercase font-pixel text-2xl tracking-wider mb-2">A Separação</strong><p className="text-[#888888]">O sistema dividirá secretamente os terminais conectados em dois grupos: <strong>Time A</strong> e <strong>Time B</strong>. Ninguém sabe quem é quem.</p></div></div>
                <div className="flex gap-6"><span className="text-4xl font-pixel text-[#FF6B35] mt-1">02_</span><div><strong className="block uppercase font-pixel text-2xl tracking-wider mb-2">O Caos na Digitação</strong><p className="text-[#888888]">No Round 1, o Time A tenta enviar uma resposta coerente. O problema? Cada membro recebe um <em>vírus secreto</em> que afeta seu texto.</p></div></div>
                <div className="flex gap-6"><span className="text-4xl font-pixel text-[#FF6B35] mt-1">03_</span><div><strong className="block uppercase font-pixel text-2xl tracking-wider mb-2">O Julgamento</strong><p className="text-[#888888]">O Time B assiste ao desastre ao vivo no Telão. Ao final do tempo, o Time B vota secretamente nas palavras mais engraçadas ou caóticas.</p></div></div>
                <div className="flex gap-6"><span className="text-4xl font-pixel text-[#FF6B35] mt-1">04_</span><div><strong className="block uppercase font-pixel text-2xl tracking-wider mb-2">A Inversão</strong><p className="text-[#888888]">No Round 2, a vingança: Os papéis se invertem. O Time B digita e sofre os efeitos dos vírus, enquanto o Time A assiste e vota.</p></div></div>
              </div>
              <div className="mt-12 p-6 bg-[#EDEBE5] border-[4px] border-[#1C1C1C] text-center font-pixel text-2xl md:text-3xl tracking-widest text-[#C8381E] animate-pulse">[!] OBJETIVO: ACUMULE PONTOS INDIVIDUAIS COM SEUS VOTOS PARA VENCER [!]</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TRANSIÇÃO 2: FADE TOTAL PARA PRETO PARA ESCONDER O RECARREGAMENTO */}
      {/* ========================================================= */}
      <div className={`fixed inset-0 z-[110] bg-[#1C1C1C] transition-opacity duration-500 pointer-events-none ${bootStep >= 5 ? 'opacity-100' : 'opacity-0'}`}></div>

    </main>
  );
}