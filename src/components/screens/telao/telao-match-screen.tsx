'use client';
import React, { useState, useEffect } from 'react';

interface Cursor {
  playerId: string;
  playerName: string;
  color: string;
  avatar: string; 
  team?: string; 
  position?: number; // ADICIONADO PARA O TYPESCRIPT NÃO RECLAMAR
}

interface TelaoMatchScreenProps {
  currentRound: number;
  activeTeam: string;
  theme: string;
  contextText?: string;
  currentText: string;
  timeLeft: number;
  activeCursors: Cursor[];
  onRoundComplete?: () => void;
  hostStartTyping?: () => void;   // ← ADICIONA
  hostLockTyping?: () => void;    // ← ADICIONA
}

type MatchPhase = 
  | 'FOLDER_SKIT'        
  | 'SHOW_CONTEXT_GIANT' 
  | 'SHOW_TEMPLATE_ZOOM' 
  | 'ROUND_2_TRANSITION' 
  | 'PREPARE'            
  | 'TYPING'             
  | 'READING'            
  | 'VOTING'             
  | 'SCORING_REVEAL'     
  | 'RESULTS_SUMMARY'    
  | 'MOUSE_CLEANUP'      
  | 'STRUGGLE_PUSH';     

export default function TelaoMatchScreen({
  currentRound,
  activeTeam,
  theme,
  contextText,
  currentText,
  timeLeft,
  activeCursors,
  onRoundComplete,
  hostStartTyping,   // ← ADICIONA
  hostLockTyping,    // ← ADICIONA
}: TelaoMatchScreenProps) {
  
  const [phase, setPhase] = useState<MatchPhase>(currentRound === 1 ? 'FOLDER_SKIT' : 'ROUND_2_TRANSITION');
  const [skitStep, setSkitStep] = useState(0);

  const [typedContext, setTypedContext] = useState('');
  const [contextShrinking, setContextShrinking] = useState(false);
  const [typedTemplate, setTypedTemplate] = useState('');
  const [templateShrinking, setTemplateShrinking] = useState(false);

  const [prepTime, setPrepTime] = useState(10); 
  const [matchTime, setMatchTime] = useState(timeLeft); 
  const [votingTime, setVotingTime] = useState(20); 
  const [typingStates, setTypingStates] = useState<Record<string, boolean>>({});
  
  const [revealingWordIndex, setRevealingWordIndex] = useState(-1);
  const [closedPopups, setClosedPopups] = useState<string[]>([]);
  const [mousePos, setMousePos] = useState({ top: '120%', left: '120%' });
  const [pushStep, setPushStep] = useState<'IDLE' | 'HALF' | 'STRUGGLE' | 'FULL'>('IDLE');

  const [r2Number, setR2Number] = useState(1);
  const [isTimerPunched, setIsTimerPunched] = useState(false);

  // FILTRA OS CURSORES E AVATARES DA EQUIPE COMPLETA DA VEZ
  const cursoresFiltrados = activeCursors.filter(c => c.team === activeTeam || !c.team);

  const cursorValido = cursoresFiltrados[0] || activeCursors[0] || { playerId: 'mock', color: '#FF6B35', avatar: '(o_o)', playerName: 'ANÔNIMO' };

  const mockScoredWords = [
    { wordIndex: 1, count: 1, cursor: cursorValido, type: 'BOM_TROCADILHO' }, 
    { wordIndex: 4, count: 3, cursor: cursorValido, type: 'CRÍTICO' }, 
  ];

  const roundResults = cursoresFiltrados.map((cursor) => {
    const points = mockScoredWords
      .filter(sw => sw.cursor.playerId === cursor.playerId)
      .reduce((sum, sw) => sum + (sw.count * 100), 0);
    return { ...cursor, points };
  }).sort((a, b) => b.points - a.points);

  const fakeAds = [
    { id: 'ad1', title: 'HOT_SINGLES.EXE', imgSrc: '/ad1.jpg', top: '15%', left: '5%' },
    { id: 'ad2', title: 'DOWNLOAD_RAM.BAT', imgSrc: '/ad2.jpg', top: '55%', left: '60%' },
    { id: 'ad3', title: 'URGENTE_ANTIVIRUS.EXE', imgSrc: '/ad3.jpg', top: '35%', left: '65%' },
  ];

  // 1. COREOGRAFIA DE ENTRADA DA PASTA E AJUSTE DO CONTADOR
  useEffect(() => {
    if (phase === 'FOLDER_SKIT') {
      const runFolderSkit = async () => {
        const wait = (ms: number) => new Promise(res => setTimeout(res, ms));
        await wait(50);
        setSkitStep(1); await wait(800);
        setSkitStep(2); await wait(1000);
        setSkitStep(3); await wait(700);
        setSkitStep(4); await wait(700);
        setSkitStep(5); await wait(700); // Timer cai torto
        setSkitStep(6); await wait(500); // Avatar arruma e bota ele reto!
        setSkitStep(7); await wait(800);
        setPhase('SHOW_CONTEXT_GIANT'); 
      };
      runFolderSkit();
    }
  }, [phase]);

  // 2. TELA GIGANTE: ALERTA DO SISTEMA
  useEffect(() => {
    if (phase === 'SHOW_CONTEXT_GIANT') {
      let i = 0;
      setTypedContext('');
      const interval = setInterval(() => {
        setTypedContext(contextText.slice(0, i));
        i++;
        if (i > contextText.length) {
          clearInterval(interval);
          setTimeout(() => {
            setContextShrinking(true); 
            setTimeout(() => setPhase('SHOW_TEMPLATE_ZOOM'), 700);
          }, 2500); 
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [phase, contextText]);

  // 3. TELA GIGANTE: MOSTRANDO A FRASE EM BRANCO HUMORÍSTICA COM REATIVIDADE COMPLETA
  useEffect(() => {
    if (phase === 'SHOW_TEMPLATE_ZOOM') {
      let i = 0;
      setTypedTemplate('');
      const interval = setInterval(() => {
        setTypedTemplate(currentText.slice(0, i));
        i++;
        if (i > currentText.length) {
          clearInterval(interval);
          setTimeout(() => {
            setTemplateShrinking(true); 
            setTimeout(() => setPhase('PREPARE'), 600);
          }, 2500); 
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [phase, currentText]);

  // TIMER CORE LOOP
  useEffect(() => {
    if (phase === 'PREPARE') {
      if (prepTime > 0) {
        const timer = setTimeout(() => setPrepTime(prepTime - 1), 1000);
        return () => clearTimeout(timer);
      } else {
          setPhase('TYPING');
          hostStartTyping?.();   // ← avisa o Firebase que saiu do PREPARE
        }
    }
    if (phase === 'TYPING') {
      if (matchTime > 0) {
        const timer = setTimeout(() => setMatchTime(matchTime - 1), 1000);
        return () => clearTimeout(timer);
      }  else {
          setPhase('READING');
          hostLockTyping?.();    // ← avisa o Firebase que travou a digitação
        }
    }
    if (phase === 'READING') {
      const utterance = new SpeechSynthesisUtterance(currentText);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.95;
      utterance.onend = () => { setTimeout(() => setPhase('VOTING'), 500); };
      window.speechSynthesis.speak(utterance);
      return () => { window.speechSynthesis.cancel(); };
    }
    if (phase === 'VOTING') {
      if (votingTime > 0) {
        const timer = setTimeout(() => setVotingTime(votingTime - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setPhase('SCORING_REVEAL');
        setRevealingWordIndex(0); 
      }
    }
    if (phase === 'SCORING_REVEAL') {
      const totalWords = currentText.split(' ').length;
      if (revealingWordIndex < totalWords) {
        const timer = setTimeout(() => {
          setRevealingWordIndex(prev => prev + 1);
        }, 400);
        return () => clearTimeout(timer);
      } else {
        setPhase('RESULTS_SUMMARY');
      }
    }
    if (phase === 'RESULTS_SUMMARY') {
      const timer = setTimeout(() => setPhase('MOUSE_CLEANUP'), 8000); 
      return () => clearTimeout(timer);
    }
  }, [phase, prepTime, matchTime, votingTime, revealingWordIndex, currentText]);

  // Limpeza dos pop-ups e transições finais mantidos
  useEffect(() => {
    if (phase === 'MOUSE_CLEANUP') {
      const runCleanup = async () => {
        const wait = (ms: number) => new Promise(res => setTimeout(res, ms));
        setMousePos({ top: 'calc(15% + 12px)', left: 'calc(5% + 265px)' });
        await wait(900); setClosedPopups(prev => [...prev, 'ad1']);
        setMousePos({ top: 'calc(55% + 12px)', left: 'calc(60% + 265px)' });
        await wait(800); setClosedPopups(prev => [...prev, 'ad2']);
        setMousePos({ top: 'calc(35% + 12px)', left: 'calc(65% + 265px)' });
        await wait(800); setClosedPopups(prev => [...prev, 'ad3']);
        await wait(1000); 
        setMousePos({ top: 'calc(50% - 190px)', left: 'calc(50% + 490px)' });
        await wait(1200); setClosedPopups(prev => [...prev, 'score']);
        setMousePos({ top: '120%', left: '120%' }); await wait(800);
        setPhase('STRUGGLE_PUSH'); setPushStep('HALF'); 
      };
      runCleanup();
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'STRUGGLE_PUSH') {
      if (pushStep === 'HALF') {
        const timer = setTimeout(() => setPushStep('STRUGGLE'), 1800); 
        return () => clearTimeout(timer);
      }
      if (pushStep === 'STRUGGLE') {
        const timer = setTimeout(() => setPushStep('FULL'), 1500); 
        return () => clearTimeout(timer);
      }
      if (pushStep === 'FULL') {
        const timer = setTimeout(() => { if (onRoundComplete) onRoundComplete(); }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [phase, pushStep, onRoundComplete]);

  // CONTROLE DO SORTIO DE BOCA: Lê a atividade em lote das equipes ativas
  useEffect(() => {
    if (phase !== 'TYPING') {
      setTypingStates({});
      return;
    }
    const interval = setInterval(() => {
      const newStates: Record<string, boolean> = {};
      cursoresFiltrados.forEach(c => { newStates[c.playerId] = Math.random() > 0.3; });
      setTypingStates(newStates);
    }, 250);
    return () => clearInterval(interval);
  }, [phase, cursoresFiltrados.length]);

  const getAnimatedAvatar = (avatar: string, isTyping?: boolean) => {
    if (!avatar) return '(?)';
    if (!isTyping) return avatar;
    const midIndex = Math.floor(avatar.length / 2);
    return avatar.substring(0, midIndex) + 'O' + avatar.substring(midIndex + 1);
  };

  const getCursorPosition = (index: number) => {
    const positions = [{ top: '40px', left: '150px' }, { top: '80px', left: '290px' }];
    return positions[index % positions.length];
  };

  const isTerminalApparent = phase !== 'FOLDER_SKIT' || skitStep >= 3;
  const isThemeApparent = phase !== 'FOLDER_SKIT' || skitStep >= 4;
  const isTimerApparent = phase !== 'FOLDER_SKIT' || skitStep >= 5;
  
  // SOLUÇÃO REAL DO TEMPORIZADOR: Fica torto UNICAMENTE no passo 5 da entrada da pasta. 
  // Assim que o skitStep vai para 6, o avatar arruma ele e ele fica 100% reto (rotate-0) para todo o resto do jogo!
  const isTimerCrooked = phase === 'FOLDER_SKIT' && skitStep === 5;
  
  const isAlertBoxReady = phase !== 'FOLDER_SKIT' && phase !== 'SHOW_CONTEXT_GIANT';
  const isTerminalTextReady = phase !== 'FOLDER_SKIT' && phase !== 'SHOW_CONTEXT_GIANT' && phase !== 'SHOW_TEMPLATE_ZOOM';
  const isPopupsActive = phase === 'RESULTS_SUMMARY' || phase === 'MOUSE_CLEANUP';

  const getSkitAvatarPosition = () => {
    switch (skitStep) {
      case 0: return { top: '60%', left: '-20vw' }; 
      case 1: return { top: '60%', left: '50vw' };  
      case 2: return { top: '60%', left: '50vw' };  
      case 3: return { top: '60%', left: '50vw' };  
      case 4: return { top: '60%', left: '50vw' };  
      case 5: return { top: '18%', left: '80vw' };  
      case 6: return { top: '18%', left: '80vw' };  
      default: return { top: '50%', left: '120vw' }; 
    }
  };
  const actorPos = getSkitAvatarPosition();

  // GARANTIDO: Travas estritas com encadeamento opcional para mitigar o crash de 'color' indefinida na revelação do placar
  // ATUALIZADO: renderText agora mapeia os caracteres para renderizar os marcadores visuais móveis no local exato!
  const renderText = () => {
    if (phase === 'SCORING_REVEAL') {
      const words = currentText.split(' ');
      return words.map((word, index) => {
        if (index === revealingWordIndex) {
          const scored = mockScoredWords.find(s => s.wordIndex === index);
          if (scored) {
            const corCursor = scored.cursor?.color || '#FF6B35';
            return (
              <span key={index} className="relative inline-block mx-1">
                <span className="px-3 py-1 text-[#1C1C1C] font-bold shadow-[4px_4px_0px_rgba(28,28,28,0.5)] animate-word-flash relative z-10 rounded-[2px]" style={{ backgroundColor: corCursor }}>{word}</span>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-points-drop z-20 pointer-events-none mt-2">
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px]" style={{ borderBottomColor: corCursor }}></div>
                  <span className="font-pixel text-xl md:text-2xl font-bold whitespace-nowrap bg-[#1C1C1C] px-2 py-1 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] border rounded-[2px]" style={{ color: corCursor, borderColor: corCursor }}>+{scored.count * 100} PTS</span>
                  <span className="font-pixel text-xs bg-[#1C1C1C] text-[#F7F5F0] px-1 mt-1 border border-[#333] tracking-widest uppercase">(x{scored.count} votos - {scored.type})</span>
                </div>
              </span>
            );
          } else {
            return <span key={index} className="mx-1 px-1 text-white bg-black animate-word-flash-fast">{word}</span>;
          }
        }
        const opacity = index < revealingWordIndex ? 'opacity-30' : 'opacity-100';
        return <span key={index} className={`transition-opacity duration-300 ${opacity}`}>{word} </span>;
      });
    }

    const chars = currentText.split("");
    return (
      <>
        {chars.map((char, index) => {
          // Trava pesada: O cursor SÓ aparece se for do time que tá digitando
          const activeCursor = cursoresFiltrados.find(c => c.position === index && c.team === activeTeam);

          return (
            <span key={index} className="relative inline">
              {activeCursor && (
                <span className="absolute -top-10 left-0 flex flex-col items-center z-50 pointer-events-none animate-fade-in" style={{ transform: 'translateY(-4px)' }}>
                  <span 
                    className="px-1.5 py-0.5 text-[10px] font-bold font-sans text-[#1C1C1C] uppercase whitespace-nowrap tracking-tighter rounded-[2px]"
                    style={{ backgroundColor: activeCursor.color || '#06D6A0' }}
                  >
                    &gt; {activeCursor.playerName}
                  </span>
                  <span 
                    className="w-[3px] h-[2.5rem] block animate-blink" 
                    style={{ backgroundColor: activeCursor.color || '#06D6A0' }}
                  />
                </span>
              )}
              {char}
            </span>
          );
        })}
        
        {cursoresFiltrados.map((c, i) => {
          if (c.position >= chars.length && c.team === activeTeam) {
            return (
              <span key={`end-${i}`} className="relative inline-block w-0 h-0">
                <span className="absolute -top-10 left-0 flex flex-col items-center z-50 pointer-events-none" style={{ transform: 'translateY(-4px)' }}>
                  <span 
                    className="px-1.5 py-0.5 text-[10px] font-bold font-sans text-[#1C1C1C] uppercase whitespace-nowrap tracking-tighter rounded-[2px]"
                    style={{ backgroundColor: c.color || '#06D6A0' }}
                  >
                    &gt; {c.playerName}
                  </span>
                  <span 
                    className="w-[3px] h-[2.5rem] block animate-blink" 
                    style={{ backgroundColor: c.color || '#06D6A0' }}
                  />
                </span>
              </span>
            );
          }
          return null;
        })}
      </>
    );
  };

  return (
    <main className="h-screen w-screen bg-[#EDEBE5] text-[#1C1C1C] p-2 md:p-3 flex flex-col font-sans select-none relative overflow-hidden transition-colors duration-500">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        .font-pixel { font-family: 'VT323', monospace !important; }
        @keyframes folder-jitter { 0% { transform: translate(2px, 2px) rotate(1deg); } 50% { transform: translate(-2px, -2px) rotate(-1deg); } 100% { transform: translate(2px, -2px) rotate(0deg); } }
        .animate-folder-jitter { animation: folder-jitter 0.12s infinite; }
        @keyframes throw-ui { 0% { transform: scale(0.1) translateY(30vh); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
        .animate-ui-brotar { animation: throw-ui 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.15) forwards; }
        @keyframes slap-arm { 0% { transform: rotate(-45deg); } 50% { transform: rotate(15deg); } 100% { transform: rotate(0deg); } }
        .animate-slap { animation: slap-arm 0.18s ease-out forwards; transform-origin: bottom right; display: inline-block; }
        .animate-blink { animation: blink 0.8s infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popup-pop { 0% { transform: scale(0.8) translate(-50%, -50%); opacity: 0; } 70% { transform: scale(1.05) translate(-50%, -50%); opacity: 1; } 100% { transform: scale(1) translate(-50%, -50%); opacity: 1; } }
        .animate-popup { animation: popup-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; transform-origin: top left; opacity: 0; }
        @keyframes adware-pop { 0% { transform: scale(0.8); opacity: 0; } 70% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        .animate-adware { animation: adware-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; pointer-events: auto; opacity: 0; }
        @keyframes eq { 0%, 100% { height: 4px; } 50% { height: 18px; } }
        .eq-1 { animation: eq 0.6s infinite; } .eq-2 { animation: eq 0.8s infinite 0.2s; } .eq-3 { animation: eq 0.5s infinite 0.4s; }
        @keyframes points-drop { 0% { transform: translate(-50%, -10px) scale(0.6); opacity: 0; } 15% { transform: translate(-50%, 0px) scale(1); opacity: 1; } 85% { transform: translate(-50%, 0px) scale(1); opacity: 1; } 100% { transform: translate(-50%, 15px) scale(0.8); opacity: 0; } }
        .animate-points-drop { animation: points-drop 3s ease-in-out forwards; }
        @keyframes word-flash { 0% { transform: scale(1); } 20% { transform: scale(1.1); filter: brightness(1.2); } 100% { transform: scale(1); } }
        .animate-word-flash { animation: word-flash 0.6s ease-out forwards; }
        @keyframes word-flash-fast { 0% { filter: invert(0); } 100% { filter: invert(1); } }
        .animate-word-flash-fast { animation: word-flash-fast 0.2s ease-out forwards; }
        @keyframes payload-jitter { 0% { transform: translate(1px, 1px) rotate(0.1deg); } 50% { transform: translate(-1px, -1px) rotate(-0.1deg); } 100% { transform: translate(1px, 1px) rotate(0.1deg); } }
        .animate-jitter { animation: payload-jitter 0.2s infinite; }
        @keyframes timer-punch-swing { 0% { transform: rotate(0deg); } 20% { transform: rotate(15deg); } 40% { transform: rotate(-10deg); } 60% { transform: rotate(5deg); } 100% { transform: rotate(0deg); } }
        .animate-timer-punch { animation: timer-punch-swing 0.6s ease-out forwards; transform-origin: top center; }
        @keyframes avatar-punch-skit { 0% { transform: translateX(0); } 50% { transform: translateX(-40px) scale(1.1); } 100% { transform: translateX(20px); opacity: 0; } }
        .animate-avatar-punch { animation: avatar-punch-skit 0.5s ease-in-out forwards; }
      `}} />

      {phase === 'SHOW_CONTEXT_GIANT' && (
        <div className={`absolute inset-0 z-[400] flex flex-col items-center justify-center p-12 bg-black bg-opacity-80 backdrop-blur-sm transition-all duration-700 ${contextShrinking ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
          <div className="max-w-5xl w-full bg-[#1C1C1C] border-[4px] border-[#C8381E] rounded-[8px] p-10 shadow-[16px_16px_0px_rgba(200,56,30,0.6)]">
            <h2 className="font-pixel text-[#C8381E] text-4xl md:text-5xl tracking-[0.1em] mb-6 uppercase flex items-center gap-4">
              <span className="bg-[#C8381E] text-[#F7F5F0] px-3 py-1 font-bold animate-pulse">[!]</span> ALERTA DE SISTEMA
            </h2>
            <p className="font-pixel text-[#F7F5F0] text-3xl md:text-4xl uppercase leading-[1.5] tracking-wide">
              {typedContext}<span className="text-[#C8381E] animate-blink">_</span>
            </p>
          </div>
        </div>
      )}

      {phase === 'SHOW_TEMPLATE_ZOOM' && (
        <div className={`absolute inset-0 z-[400] flex flex-col items-center justify-center p-12 bg-black bg-opacity-80 backdrop-blur-sm transition-all duration-700 ${templateShrinking ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
          <div className="max-w-5xl w-full flex flex-col items-center">
            <h3 className="font-pixel text-[#F7F5F0] text-3xl uppercase tracking-widest mb-8 bg-[#1C1C1C] px-6 py-2 border-[4px] border-[#333]">
              {"// DESCRIPTOGRAFANDO RASCUNHO_"}
            </h3>
            <div className="bg-[#FF6B35] text-[#1C1C1C] border-[6px] border-[#1C1C1C] px-12 py-8 shadow-[16px_16px_0px_#1C1C1C] transform -rotate-2">
              <p className="font-pixel text-4xl md:text-5xl font-bold uppercase text-center leading-snug">
                {typedTemplate}<span className="animate-blink text-[#1C1C1C]">|</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {phase === 'FOLDER_SKIT' && (
        <div className={`absolute z-[300] font-pixel text-6xl flex flex-col items-center gap-2 drop-shadow-[5px_5px_0px_rgba(0,0,0,0.2)] transition-all ease-in-out duration-500 ${skitStep >= 3 ? 'text-[#F7F5F0]' : 'text-[#1C1C1C]'}`} style={{ top: actorPos.top, left: actorPos.left, transform: 'translate(-50%, -50%)' }}>
          <div className="flex items-center gap-2">
            <span>{cursoresFiltrados[0]?.avatar || activeCursors[0]?.avatar || '(^-^)'}</span>
            {skitStep === 6 && <span className="text-[#FF6B35] font-bold animate-slap">/</span>}
          </div>
          {skitStep <= 4 && (
            <div className={`w-20 h-14 bg-[#FF6B35] border-[5px] border-[#1C1C1C] rounded-[4px] relative shadow-[6px_6px_0px_rgba(0,0,0,0.15)] mt-2 transition-all duration-300 ${skitStep === 2 ? 'animate-folder-jitter' : ''} ${skitStep >= 4 ? 'scale-50 opacity-0 translate-y-[-20px]' : 'scale-100 opacity-100'}`}>
              <div className="absolute top-[-11px] left-2 w-7 h-3 bg-[#FF6B35] border-t-[5px] border-x-[5px] border-[#1C1C1C] rounded-t-[3px]"></div>
              <div className="absolute inset-x-2 top-3 border-t-[3px] border-[#1C1C1C] opacity-30"></div>
              <div className="absolute inset-x-2 top-6 border-t-[3px] border-[#1C1C1C] opacity-30"></div>
            </div>
          )}
        </div>
      )}

      <div className="w-full h-full flex flex-col gap-3">
        <div className="flex gap-3 z-20 h-24 md:h-28">
          <div className={`flex-1 bg-[#1C1C1C] text-[#F7F5F0] border-[4px] border-[#1C1C1C] rounded-[8px] flex justify-between items-center px-6 py-2 shadow-[6px_6px_0px_rgba(28,28,28,0.1)] transition-all duration-300 ${isThemeApparent ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${phase === 'FOLDER_SKIT' && skitStep === 4 ? 'animate-ui-brotar' : ''}`}>
            <div>
              <div className="font-pixel text-[#FF6B35] text-sm md:text-base uppercase tracking-widest">Round 0{currentRound}</div>
              <div className="font-pixel text-2xl md:text-4xl uppercase tracking-[0.4em]">TEMA: {theme}</div>
            </div>
            <div className="flex items-center gap-4 border-l-[4px] border-[#333] pl-6 h-full">
              <span className="font-pixel text-lg text-[#888] hidden sm:block uppercase tracking-widest">Invadindo:</span>
              <span className="bg-[#FF6B35] text-[#1C1C1C] px-4 py-2 font-pixel text-xl md:text-3xl font-bold tracking-widest rounded-[4px] shadow-[3px_3px_0px_rgba(0,0,0,0.3)]">{activeTeam}</span>
            </div>
          </div>

          <div className={`w-48 md:w-56 border-[4px] border-[#1C1C1C] rounded-[8px] flex flex-col items-center justify-center transition-all shadow-[6px_6px_0px_rgba(28,28,28,0.1)] relative origin-center ${isTimerApparent ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${phase === 'FOLDER_SKIT' && skitStep === 5 ? 'animate-ui-brotar' : ''} ${isTimerCrooked ? 'rotate-[8deg] translate-y-3 animate-timer-punch' : 'rotate-0 translate-y-0 duration-200'} ${phase === 'PREPARE' ? 'bg-[#D0CEC8]' : (matchTime <= 10 && phase === 'TYPING') ? 'bg-[#C8381E] text-white animate-pulse' : 'bg-[#FF6B35]'}`}>
            {phase === 'ROUND_2_TRANSITION' && r2Number === 2 && !isTimerPunched && (
              <div className="absolute right-[-80px] top-4 font-pixel text-3xl animate-avatar-punch z-50">{cursoresFiltrados[0]?.avatar || activeCursors[0]?.avatar || '(>_<)'}=D</div>
            )}
            <span className="font-pixel text-xs uppercase font-bold text-center tracking-widest">
              {phase === 'PREPARE' ? 'PREPARAR' : phase === 'TYPING' ? 'TEMPO RESTANTE' : 'STATUS_SYS'}
            </span>
            <span className="font-pixel text-[3.5rem] md:text-[4.5rem] font-bold leading-none">
              {phase === 'PREPARE' ? prepTime : phase === 'TYPING' ? matchTime.toString().padStart(2, '0') : '--'}
            </span>
          </div>
        </div>

        <div className={`flex-1 relative transition-transform duration-[1200ms] ease-out z-10 flex flex-col ${pushStep === 'HALF' ? 'translate-x-[50vw]' : pushStep === 'STRUGGLE' ? 'translate-x-[50vw] scale-[0.98]' : pushStep === 'FULL' ? 'translate-x-[150vw] rotate(5deg)' : 'translate-x-0'}`}>
          {pushStep !== 'IDLE' && (
            <div className={`absolute top-1/2 right-full transform -translate-y-1/2 flex flex-col gap-6 items-end z-[100] pr-4 pointer-events-none ${pushStep === 'STRUGGLE' ? 'animate-jitter' : ''}`}>
              {cursoresFiltrados.map((c) => (
                <div key={`push-${c.playerId}`} className="font-pixel text-[4rem] font-bold tracking-tighter whitespace-nowrap drop-shadow-[5px_5px_0px_rgba(0,0,0,0.5)] transition-transform duration-200">
                  <span style={{ color: c.color }}>{c.avatar}{pushStep === 'STRUGGLE' ? '###&gt;' : '===&gt;'}</span>
                </div>
              ))}
            </div>
          )}

          <div className={`flex-1 flex flex-col bg-[#1C1C1C] border-[4px] border-[#1C1C1C] rounded-[8px] overflow-hidden shadow-[8px_8px_0px_rgba(28,28,28,0.1)] transition-all duration-300 ease-in-out ${isTerminalApparent ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${phase === 'FOLDER_SKIT' && skitStep === 3 ? 'animate-ui-brotar' : ''}`}>
            <div className="bg-[#1C1C1C] border-b-[4px] border-[#333] p-4 md:p-5 h-auto transition-all min-h-[90px]">
              {isAlertBoxReady && (
                <div className="animate-fade-in">
                  <h3 className="font-pixel text-[#C8381E] text-lg md:text-xl tracking-widest uppercase flex items-center gap-3">
                    <span className="bg-[#C8381E] text-[#F7F5F0] px-2 font-bold">[!]</span> ALERTA_DE_SISTEMA_
                  </h3>
                  <p className="font-pixel text-[#F7F5F0] text-lg md:text-xl tracking-widest uppercase opacity-80 pl-12 break-words whitespace-normal leading-snug">{contextText}</p>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col bg-[#0A0A0A] relative">
              <div className="bg-[#1C1C1C] px-4 py-1.5 border-b-[2px] border-[#333] flex justify-between font-pixel text-[#666] uppercase text-sm tracking-widest relative z-10">
                <span>~/RASCUNHO_DE_RESPOSTA.LOG</span>
                <span className={`transition-colors duration-300 font-bold ${phase === 'TYPING' || phase === 'SCORING_REVEAL' ? 'text-[#FF6B35]' : 'text-[#C8381E]'}`}>
                  {phase === 'TYPING' ? 'INSERT_MODE_ACTIVE' : phase === 'SCORING_REVEAL' ? 'PROCESSANDO_SCORE...' : 'LOCK_MODE_READ_ONLY'}
                </span>
              </div>

              <div className="flex-1 flex relative overflow-hidden justify-center items-center">
                {isTerminalTextReady && (
                  <div className="w-full h-full flex animate-fade-in p-4 z-10">
                    <div className="w-12 border-r-[2px] border-[#333] flex flex-col items-end pr-4 py-1 font-pixel text-[#333] text-[2rem] md:text-[2.5rem] leading-[1.6]">
                      <span>01</span><span>02</span><span>03</span>
                    </div>
                    <div className="flex-1 pl-6 py-1 font-pixel text-[2rem] md:text-[2.5rem] leading-[1.6] tracking-wide text-[#F7F5F0] relative">
                      {renderText()}
                    </div>
                  </div>
                )}

                {phase === 'PREPARE' && (
                  <div className="absolute inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center z-50 backdrop-blur-[2px] animate-fade-in">
                    <div className="border-[4px] border-[#06D6A0] bg-[#1C1C1C] p-8 flex flex-col items-center shadow-[12px_12px_0px_rgba(6,214,160,0.3)] rounded-[8px] max-w-md text-center">
                      <h2 className="font-pixel text-[#06D6A0] text-4xl tracking-[0.2em] uppercase mb-4 animate-pulse">TRAVA DE CURSORES</h2>
                      <p className="font-pixel text-[#F7F5F0] text-xl uppercase tracking-wider mb-4">Membros do {activeTeam}: Selecionem o ponto de inserção no celular!</p>
                      <div className="font-pixel text-[#1C1C1C] text-xl tracking-[0.1em] bg-[#06D6A0] px-4 py-2 uppercase font-bold rounded-[4px]">BLOQUEIO DA JANELA EM: {prepTime}s</div>
                    </div>
                  </div>
                )}

                {phase === 'VOTING' && (
                  <div className="absolute inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center z-40 backdrop-blur-[2px] animate-fade-in">
                    <div className="border-[4px] border-[#FF6B35] bg-[#1C1C1C] p-10 flex flex-col items-center shadow-[12px_12px_0px_#FF6B35] rounded-[4px] text-center">
                      <h2 className="font-pixel text-[#F7F5F0] text-5xl uppercase tracking-[0.2em]">Avaliação_Ativa</h2>
                      <p className="font-pixel text-[#FF6B35] text-2xl tracking-widest animate-pulse mt-4 uppercase bg-[#2a0b06] border border-[#FF6B35] px-6 py-2 rounded-[2px]">VOTEM NAS PALAVRAS PELO CELULAR [{votingTime}s]</p>
                    </div>
                  </div>
                )}
                
                {phase === 'READING' && (
                  <div className="absolute bottom-6 right-6 bg-[#1C1C1C] border-[4px] border-[#FF6B35] px-5 py-3 flex items-center gap-4 animate-fade-in shadow-[6px_6px_0px_#FF6B35] rounded-[4px] z-50">
                    <div className="flex gap-1 h-5 items-end shrink-0">
                      <div className="w-1.5 bg-[#FF6B35] eq-1"></div>
                      <div className="w-1.5 bg-[#FF6B35] eq-2"></div>
                      <div className="w-1.5 bg-[#FF6B35] eq-3"></div>
                    </div>
                    <span className="font-pixel text-xl uppercase tracking-widest text-[#FF6B35]">Audio_Playback</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#1C1C1C] border-t-[4px] border-[#333] px-4 py-3 flex items-center gap-6 shrink-0 overflow-hidden relative z-10">
              <span className="font-pixel text-[#666] text-sm tracking-widest uppercase flex-none">AGENTES_CONECTADOS:</span>
              <div className="flex flex-wrap gap-6 items-center flex-1">
                {cursoresFiltrados.map(c => (
                  <div key={c.playerId} className="flex items-center gap-2 font-pixel animate-fade-in" style={{ color: c.color }}>
                    <span className="text-2xl transition-all duration-100">{getAnimatedAvatar(c.avatar, typingStates[c.playerId])}</span>
                    <span className="uppercase text-sm font-bold opacity-80 tracking-widest">{c.playerName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isPopupsActive && (
        <div className="absolute inset-0 z-[100] pointer-events-none">
          {!closedPopups.includes('score') && (
            <div className="absolute top-1/2 left-1/2 w-[85vw] max-w-5xl bg-[#1C1C1C] border-[4px] border-[#FF6B35] shadow-[20px_20px_0px_rgba(0,0,0,0.8)] animate-popup z-[150] origin-center rounded-[8px]" style={{ transform: 'translate(-50%, -50%)', animationDelay: '0s', animationFillMode: 'forwards' }}>
              <div className="bg-[#FF6B35] text-[#1C1C1C] px-6 py-3.5 flex justify-between items-center font-pixel text-3xl tracking-[0.2em] font-bold uppercase border-b-[4px] border-[#1C1C1C]">
                <span>RELATÓRIO_DE_INVASÃO (PAYLOAD_SUCCESS)</span>
                <div className="border-[3px] border-[#1C1C1C] w-10 h-10 flex items-center justify-center font-bold text-2xl pb-1.5 shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">X</div>
              </div>
              <div className="p-8 md:p-10 bg-[#0A0A0A]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 content-start">
                  {roundResults.map((result) => (
                    <div key={result.playerId} className="flex items-center justify-between border-[3px] border-[#333] p-4 bg-[#141414] shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
                      <div className="flex items-center gap-5">
                        <span className="font-pixel text-5xl" style={{ color: result.color }}>{result.avatar}</span>
                        <span className="font-pixel text-2xl tracking-widest text-[#F7F5F0] uppercase truncate w-full">{result.playerName}</span>
                      </div>
                      <span className="font-pixel text-5xl font-bold tracking-widest ml-4 shrink-0" style={{ color: result.color }}>+{result.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {fakeAds.map((ad, i) => !closedPopups.includes(ad.id) && (
            <div key={ad.id} className="absolute w-72 bg-[#C0C0C0] border-t-[3px] border-l-[3px] border-t-white border-l-white border-b-[3px] border-r-[3px] border-b-black border-r-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)] animate-adware flex flex-col pointer-events-auto" style={{ top: ad.top, left: ad.left, zIndex: 200 + i, animationDelay: `${1.5 + (i * 1.5)}s`, animationFillMode: 'forwards' }} >
              <div className="bg-[#000080] text-white font-pixel px-2 py-1 flex justify-between items-center text-lg tracking-widest shrink-0">
                <span>{ad.title}</span>
                <div className="bg-[#C0C0C0] text-black border-t-[2px] border-l-[2px] border-t-white border-l-white border-b-[2px] border-r-[2px] border-b-black border-r-black w-6 h-6 flex items-center justify-center font-bold pb-1 cursor-pointer">x</div>
              </div>
              <div className="flex-1 bg-black flex items-center justify-center overflow-hidden border-[2px] border-t-black border-l-black border-b-white border-r-white m-1">
                <img src={ad.imgSrc} alt={ad.title} className="w-full h-auto object-cover" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300x150?text=IMAGEM_NAO_ENCONTRADA'; }} />
              </div>
            </div>
          ))}

          {phase === 'MOUSE_CLEANUP' && (
            <div className="absolute z-[1000] transition-all duration-700 ease-out pointer-events-none" style={{ top: mousePos.top, left: mousePos.left }}>
              <svg width="32" height="48" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(3px 3px 0px rgba(0,0,0,0.5))' }}>
                <path d="M1 1L1 26L8 20L13 32L17 30L12 18L21 18L1 1Z" fill="white" stroke="black" strokeWidth="2"/>
              </svg>
            </div>
          )}
        </div>
      )}
    </main>
  );
}