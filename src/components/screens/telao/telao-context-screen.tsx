'use client';
import React, { useState, useEffect } from 'react';

interface Player {
  id: string;
  name: string;
  avatar: string;
}

interface TelaoContextScreenProps {
  theme: string;
  contextText?: string;
  players: Player[];
  onSequenceComplete: () => void;
}

export default function TelaoContextScreen({ theme, players, onSequenceComplete }: TelaoContextScreenProps) {
  const [step, setStep] = useState(-3);
  const [readyPlayers, setReadyPlayers] = useState<string[]>([]);
  const [bootCommand, setBootCommand] = useState('');
  const [voteCount, setVoteCount] = useState(0);

  // Controle minucioso da coreografia (0 a 13)
  const [skitStep, setSkitStep] = useState(0);

  useEffect(() => {
    if (step === -3) {
      const fullCommand = "sudo reboot --force init_caos_protocol";
      let i = 0;
      const interval = setInterval(() => {
        setBootCommand(fullCommand.slice(0, i));
        i++;
        if (i > fullCommand.length) {
          clearInterval(interval);
          setTimeout(() => setStep(-2), 800);
        }
      }, 40);
      return () => clearInterval(interval);
    }
  }, [step]);

  useEffect(() => {
    if (step === -2) {
      const timer = setTimeout(() => setStep(-1), 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (step === -1 && voteCount < players.length) {
      const timer = setTimeout(() => {
        setVoteCount(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [step, voteCount, players.length]);

  useEffect(() => {
    if (step === -1 && voteCount === players.length) {
      setTimeout(() => setStep(0), 1500);
    }
  }, [voteCount, players.length, step]);

  useEffect(() => {
    if (step === 0) setTimeout(() => setStep(1), 3500);
  }, [step]);

  useEffect(() => {
    if (step === 1 && readyPlayers.length < players.length) {
      const timer = setTimeout(() => {
        setReadyPlayers(prev => {
          if (prev.length < players.length) {
            return [...prev, players[prev.length].id];
          }
          return prev;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step, readyPlayers.length, players]);

  // GATILHO DA ESQUETE
  useEffect(() => {
    if (step === 1 && readyPlayers.length === players.length) {
      setTimeout(() => setStep(2), 2000); // 2 segs pra ler "TODOS SINCRONIZADOS"
    }
  }, [readyPlayers.length, players.length, step]);

  // A COREOGRAFIA FLUIDA (Tempo vs Ação)
  useEffect(() => {
    if (step === 2) {
      const runSkit = async () => {
        const wait = (ms: number) => new Promise(res => setTimeout(res, ms));
        
        // MÁGICA: Espera 50ms para o React registrar os bonecos escondidos fora da tela!
        await wait(50);

        // 1. Avatar 1 ENTRA correndo da esquerda JÁ COM A MARRETA
        setSkitStep(1); 
        await wait(800);
        
        // 2. Voa pro Header
        setSkitStep(2); 
        await wait(600);
        
        // 3. PANCADA NO HEADER
        setSkitStep(3); 
        await wait(600);
        
        // 4. Desce pro Footer
        setSkitStep(4);
        await wait(600);
        
        // 5. PANCADA NO FOOTER
        setSkitStep(5);
        await wait(600);

        // 6. Vai pro meio
        setSkitStep(6);
        await wait(600);

        // 7. PANCADA NO CENTRO
        setSkitStep(7);
        await wait(600);

        // 8. FOGE PELA DIREITA
        setSkitStep(8);
        await wait(1000);

        // 9. AVATAR 2 ENTRA ARRASTANDO ALAVANCA DA DIREITA
        setSkitStep(9);
        await wait(1000);

        // 10. DEIXA A ALAVANCA NO CHÃO E SE PREPARA
        setSkitStep(10);
        await wait(400);

        // 11. PULA NA ALAVANCA
        setSkitStep(11);
        await wait(400);

        // 12. ZAP! LUZ BRANCA E ELE CAI DO LADO
        setSkitStep(12);
        await wait(1000);

        // 13. FOGEM PELA ESQUERDA LEVANDO A ALAVANCA!
        setSkitStep(13);
        await wait(800);

        // FIM DA TRANSIÇÃO
        onSequenceComplete(); 
      };
      runSkit();
    }
  }, [step, onSequenceComplete]);

  const isHeaderSmacked = skitStep >= 3;
  const isFooterSmacked = skitStep >= 5;
  const isCenterSmacked = skitStep >= 7;

  // Lógica de Posições (Eles nascem sempre nas bordas)
  const getP1Position = () => {
    switch (true) {
      case skitStep === 0: return { top: '50%', left: '-20vw', rotate: '0deg' }; // Começa fora
      case skitStep === 1: return { top: '50%', left: '20vw', rotate: '0deg' };  // Entra correndo
      case skitStep === 2: return { top: '10%', left: '20vw', rotate: '0deg' };
      case skitStep === 3: return { top: '10%', left: '25vw', rotate: '-20deg' };
      case skitStep === 4: return { top: '90%', left: '20vw', rotate: '0deg' };
      case skitStep === 5: return { top: '90%', left: '25vw', rotate: '-20deg' };
      case skitStep === 6: return { top: '50%', left: '35vw', rotate: '0deg' };
      case skitStep === 7: return { top: '50%', left: '40vw', rotate: '-20deg' };
      case skitStep >= 8:  return { top: '50%', left: '120vw', rotate: '0deg' }; // Foge Direita
      default: return { top: '50%', left: '-20vw', rotate: '0deg' };
    }
  };

  const getP2Position = () => {
    switch (true) {
      case skitStep <= 8: return { top: '60%', left: '120vw', rotate: '0deg' };  // Esperando fora (Direita)
      case skitStep === 9: return { top: '60%', left: '85vw', rotate: '0deg' };  // Entra puxando a alavanca
      case skitStep === 10: return { top: '60%', left: '85vw', rotate: '0deg' }; // Solta pra pular
      case skitStep === 11: return { top: '35%', left: '72vw', rotate: '15deg' };// Pulo em cima da alavanca!
      case skitStep === 12: return { top: '60%', left: '85vw', rotate: '0deg' }; // Cai do lado
      case skitStep === 13: return { top: '60%', left: '-20vw', rotate: '0deg' };// Foge pela esquerda
      default: return { top: '60%', left: '-20vw', rotate: '0deg' };
    }
  };

  const getLeverPosition = () => {
    switch (true) {
      case skitStep <= 8: return { top: '60%', left: '130vw' }; // Escondida na direita
      case skitStep >= 9 && skitStep <= 12: return { top: '60%', left: '75vw' }; // Posicionada no meio
      case skitStep === 13: return { top: '60%', left: '-30vw' }; // Arrastada pra esquerda junto com o Avatar 2
      default: return { top: '60%', left: '-30vw' };
    }
  };

  const p1 = getP1Position();
  const p2 = getP2Position();
  const lever = getLeverPosition();

  return (
    <main className={`h-screen w-screen font-sans select-none relative overflow-hidden flex flex-col justify-between p-8 md:p-12 transition-colors duration-200
      ${skitStep >= 12 ? 'bg-[#EDEBE5]' : 'bg-[#1C1C1C] text-[#FF6B35]'}`}>
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        .font-pixel { font-family: 'VT323', monospace !important; }
        
        @keyframes biosScroll { from { transform: translateY(0); } to { transform: translateY(-50%); } }
        .animate-bios { animation: biosScroll 3s linear infinite; }

        @keyframes scanlineMove { 0% { transform: translateY(-100vh); } 100% { transform: translateY(100vh); } }
        .animate-scanner { animation: scanlineMove 2.5s linear infinite; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }

        @keyframes hit-swing {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(-60deg) translateX(-20px); }
          100% { transform: rotate(45deg) translateX(30px); }
        }
        .animate-hit { animation: hit-swing 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; transform-origin: bottom right; display: inline-block; }

        @keyframes fly-away-top { 0% { transform: translateY(0) rotate(0); opacity: 1; } 100% { transform: translate(50vw, -100vh) rotate(45deg); opacity: 0; display: none; } }
        .animate-fly-top { animation: fly-away-top 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }

        @keyframes fly-away-bottom { 0% { transform: translateY(0) rotate(0); opacity: 1; } 100% { transform: translate(50vw, 100vh) rotate(-45deg); opacity: 0; display: none; } }
        .animate-fly-bottom { animation: fly-away-bottom 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }

        @keyframes explode-center { 0% { transform: scale(1); opacity: 1; filter: blur(0px); } 100% { transform: scale(0.5) translate(100vw, -50vh) rotate(20deg); opacity: 0; filter: blur(4px); display: none; } }
        .animate-explode-center { animation: explode-center 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }

        @keyframes flash-zap { 0%, 100% { opacity: 0; } 10%, 30%, 50% { opacity: 1; background-color: white; filter: invert(1); } 20%, 40% { opacity: 1; background-color: #FF6B35; } }
        .animate-zap { animation: flash-zap 0.6s ease-out forwards; }
      `}} />

      {/* CLARÃO DA ALAVANCA */}
      {skitStep === 12 && <div className="absolute inset-0 z-[500] animate-zap pointer-events-none"></div>}

      {/* EFEITOS CRT RESTRITOS À INICIALIZAÇÃO */}
      {(step === -3 || step === -2) && (
        <>
          <div className="absolute inset-0 pointer-events-none opacity-20 z-50 animate-scanner" style={{ height: '6px', backgroundColor: '#FF6B35', boxShadow: '0 0 20px #FF6B35' }}></div>
          <div className="absolute inset-0 pointer-events-none opacity-20 z-50" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)' }}></div>
        </>
      )}

      {/* CABEÇALHO DO SISTEMA */}
      <div className={`border-b-[4px] border-[#FF6B35] pb-4 opacity-80 flex justify-between font-pixel text-xl tracking-widest uppercase transition-all origin-left
        ${isHeaderSmacked ? 'animate-fly-top' : ''}`}>
        <span>INCOMING_TRANSMISSION: ADMIN_SERVER_</span>
        <span className="animate-pulse">● SECURE_CHANNEL_ACTIVE_</span>
      </div>

      {/* CONTEÚDO CENTRAL (MIOLO DO TERMINAL) */}
      <div className={`max-w-5xl mx-auto my-auto w-full flex flex-col items-center transition-all origin-center
        ${isCenterSmacked ? 'animate-explode-center' : ''}`}>
        
        {step === -3 && (
          <div className="w-full text-left font-pixel text-2xl md:text-4xl tracking-[0.15em] p-4">
            <span className="opacity-50">SYS:\&gt;</span> {bootCommand}<span className="animate-pulse text-[#FF6B35]">_</span>
          </div>
        )}

        {step === -2 && (
          <div className="w-full overflow-hidden h-[300px] opacity-60 text-lg md:text-xl font-pixel tracking-wider relative">
            <div className="animate-bios absolute flex flex-col gap-1 text-[#FF6B35]">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i}>0x{Math.random().toString(16).substr(2, 8).toUpperCase()} INITIALIZING_CORE_MODULE_{i} ... [OK]</div>
              ))}
            </div>
          </div>
        )}

        {step === -1 && (
          <div className="w-full max-w-3xl border-[4px] border-[#FF6B35] p-8 md:p-12 bg-black bg-opacity-40 animate-fade-in flex flex-col items-center">
            <h2 className="font-pixel text-3xl md:text-5xl tracking-widest uppercase mb-8 text-center animate-pulse border-b-[4px] border-dashed border-[#FF6B35] pb-4">[ SELEÇÃO_DE_CENÁRIO ]</h2>
            <div className="w-full mb-6">
              <div className="flex justify-between font-pixel text-xl md:text-2xl tracking-widest mb-2 text-[#888]">
                <span>RECEBENDO_VOTOS...</span>
                <span className="text-[#FF6B35]">[{voteCount}/{players.length}]</span>
              </div>
              <div className="w-full h-8 bg-[#1C1C1C] border-[2px] border-[#FF6B35] overflow-hidden">
                <div className="h-full bg-[#FF6B35] transition-all duration-500 ease-out" style={{ width: `${(voteCount / players.length) * 100}%` }}></div>
              </div>
            </div>
            <p className="font-pixel text-xl text-[#F7F5F0] tracking-widest text-center">UTILIZE SEU DISPOSITIVO PARA VOTAR NO TEMA DA SESSÃO.</p>
          </div>
        )}

        {step === 0 && (
          <div className="text-center animate-fade-in flex flex-col items-center">
            <span className="font-pixel text-2xl md:text-3xl tracking-widest text-[#888] mb-4">// ESTABELECENDO_ALVO:</span>
            <div className="bg-[#FF6B35] text-[#1C1C1C] border-[4px] border-[#FF6B35] px-8 py-4 shadow-[8px_8px_0px_#888888] transform -rotate-2">
              <h1 className="font-pixel text-[clamp(3rem,6vw,5rem)] tracking-widest uppercase leading-none">{theme}</h1>
            </div>
            <span className="font-pixel text-xl tracking-widest text-[#FF6B35] mt-12 animate-pulse">EXTRAINDO_DADOS...</span>
          </div>
        )}

        {(step === 1 || step === 2) && (
          <div className="w-full flex flex-col items-center animate-fade-in relative">
            <div className="text-center mb-12">
              <h2 className="font-pixel text-5xl md:text-7xl text-[#F7F5F0] tracking-widest uppercase mb-2" style={{ textShadow: '4px 4px 0px #FF6B35' }}>ROUND 1</h2>
              <p className="font-pixel text-2xl tracking-widest text-[#888] uppercase">DISTRIBUINDO_PAPEIS_CRIPTOGRAFADOS_</p>
            </div>

            <div className="w-full max-w-3xl bg-[#FF6B35] border-[4px] border-[#FF6B35] p-6 text-[#1C1C1C] shadow-[8px_8px_0px_#888888] relative">
              <div className="font-pixel text-2xl font-bold tracking-widest border-b-[4px] border-[#1C1C1C] pb-4 mb-6 flex justify-between items-end">
                <span>VERIFIQUE SEU CELULAR</span>
                <span className="text-lg">[{readyPlayers.length}/{players.length}]</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                {players.map((player) => {
                  const isReady = readyPlayers.includes(player.id);
                  // REVERTIDO: Eles ficam normais na tela, sem [OFF] e sem sumir da caixa!
                  return (
                    <div key={player.id} className={`flex items-center justify-between p-3 border-[4px] font-pixel text-xl tracking-widest transition-all duration-300 
                      ${isReady ? 'bg-[#1C1C1C] text-[#FF6B35] border-[#1C1C1C]' : 'bg-transparent text-[#1C1C1C] border-[#1C1C1C] opacity-60'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{player.avatar}</span>
                        <span>{player.name}</span>
                      </div>
                      <span>{isReady ? '[OK]' : '[WAIT]'}</span>
                    </div>
                  );
                })}
              </div>

              {readyPlayers.length === players.length && (
                <div className={`mt-8 text-center font-pixel text-3xl tracking-widest uppercase border-[4px] transition-colors duration-500
                  ${skitStep >= 1 ? 'bg-transparent text-[#1C1C1C] border-[#1C1C1C] opacity-50' : 'bg-[#1C1C1C] text-[#F7F5F0] border-[#1C1C1C] p-4 animate-pulse'}`}>
                  &gt;&gt;&gt; TODOS_OS_NOS_SINCRONIZADOS &lt;&lt;&lt;
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* RODAPÉ DO TERMINAL */}
      <div className={`border-t-[4px] border-[#FF6B35] pt-4 opacity-60 flex justify-between font-pixel text-lg tracking-widest uppercase transition-all origin-left
        ${isFooterSmacked ? 'animate-fly-bottom' : ''}`}>
        <span>SYS_SECURE_PROTOCOL_VT100</span>
        <span>NO_EMOJIS_ALLOWED</span>
      </div>


      {/* =========================================================================
          OS ATORES GANHAM VIDA! (Renderizados e estacionados fora da tela desde o step 2)
          ========================================================================= */}
      {step === 2 && (
        <div className="absolute inset-0 pointer-events-none z-[400] font-pixel">
          
          {/* ATOR 1: O Quebrador com a Marreta */}
          <div className={`absolute text-5xl flex items-center gap-2 drop-shadow-[6px_6px_0px_rgba(0,0,0,0.6)] transition-all ease-in-out
               ${skitStep >= 12 ? 'text-[#1C1C1C]' : 'text-[#F7F5F0]'}`}
               style={{ 
                 top: p1.top, left: p1.left, transform: `translate(-50%, -50%) rotate(${p1.rotate})`, 
                 transitionDuration: skitStep <= 1 ? '800ms' : '600ms'
               }}>
             <span>{players[0]?.avatar || '(>_<)'}</span>
             
             <span className={`text-[#FF6B35] font-bold ${(skitStep === 3 || skitStep === 5 || skitStep === 7) ? 'animate-hit' : ''}`}>
               ===T
             </span>
          </div>

          {/* ATOR 2: O Puxador de Alavanca */}
          <div className={`absolute text-5xl flex items-center gap-2 drop-shadow-[6px_6px_0px_rgba(0,0,0,0.6)] transition-all ease-in-out
               ${skitStep >= 12 ? 'text-[#1C1C1C]' : 'text-[#F7F5F0]'}`}
               style={{ 
                 top: p2.top, left: p2.left, transform: `translate(-50%, -50%) rotate(${p2.rotate})`, 
                 transitionDuration: skitStep === 9 ? '1000ms' : skitStep === 11 ? '400ms' : '800ms'
               }}>
             <span>{players[1]?.avatar || '(O_O)'}</span>
          </div>

          {/* A ALAVANCA INDUSTRIAL */}
          <div className="absolute flex flex-col items-center transition-all ease-in-out"
               style={{
                 top: lever.top, 
                 left: lever.left,
                 transform: 'translate(-50%, -50%)',
                 transitionDuration: skitStep === 9 ? '1000ms' : skitStep === 13 ? '800ms' : '600ms'
               }}>
            
            <div className={`flex flex-col items-center transition-transform duration-100 origin-bottom
                 ${skitStep >= 11 ? 'rotate-[45deg]' : '-rotate-[45deg]'}`}>
              <div className="w-10 h-10 bg-[#FF6B35] border-[4px] border-[#1C1C1C] rounded-sm shadow-[inset_-4px_-4px_0px_rgba(0,0,0,0.3)] z-10"></div>
              <div className="w-4 h-24 bg-[#D0CEC8] border-x-[4px] border-[#1C1C1C] -mt-2"></div>
            </div>
            
            <div className="w-32 h-16 bg-[#D0CEC8] border-[4px] border-[#1C1C1C] shadow-[8px_8px_0px_rgba(0,0,0,0.8)] relative -mt-4 flex items-center justify-center">
               <div className="w-20 h-4 bg-[#1C1C1C] rounded-full"></div>
               <div className="absolute top-2 left-2 w-2 h-2 bg-[#1C1C1C] rounded-full"></div>
               <div className="absolute top-2 right-2 w-2 h-2 bg-[#1C1C1C] rounded-full"></div>
               <div className="absolute bottom-2 left-2 w-2 h-2 bg-[#1C1C1C] rounded-full"></div>
               <div className="absolute bottom-2 right-2 w-2 h-2 bg-[#1C1C1C] rounded-full"></div>
            </div>
          </div>

        </div>
      )}

    </main>
  );
}