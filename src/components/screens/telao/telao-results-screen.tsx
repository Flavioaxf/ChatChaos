'use client';
import React, { useState, useEffect, useMemo } from 'react';

interface PlayerResult {
  id: string;
  name: string;
  avatar: string;
  color: string;
  totalPoints: string; 
  badge: string; 
  secretRole: string;      
}

interface TelaoFinalResultsScreenProps {
  theme?: string;
  playersRanked?: PlayerResult[]; 
  onMainMenu?: () => void;    
  onPlayAgain?: () => void;   
}

type ResultsPhase = 
  | 'PRINTING_REPORT' 
  | 'FILE_EXPLORER' 
  | 'REVEAL_1ST_AND_ADS' 
  | 'FINAL_SUMMARY'
  | 'RESTORE_SECURITY'
  | 'HACKING_NEW_TARGET';

// DADOS DE TESTE
const MOCK_PLAYERS: PlayerResult[] = [
  { id: 'p1', name: 'FLAVIO_AXF', avatar: '(>_<)', color: '#FF6B35', totalPoints: '4500', badge: 'MASTER_HACKER', secretRole: 'HACKEADO' },
  { id: 'p2', name: 'DUPLA_BACK', avatar: '(0_0)', color: '#4D96FF', totalPoints: '3200', badge: 'SOBREVIVENTE', secretRole: 'IRRITADO' },
  { id: 'p3', name: 'RAUL_PARADEDA', avatar: '(^_^)', color: '#FFD166', totalPoints: '2100', badge: 'REI_DO_CAOS', secretRole: 'BEBADO' },
  { id: 'p4', name: 'AGENT_007', avatar: '[^_^]', color: '#06D6A0', totalPoints: '1800', badge: 'NOVATO', secretRole: 'MANDARIM' },
  { id: 'p5', name: 'SYS_ADMIN', avatar: '(T_T)', color: '#C8381E', totalPoints: '1200', badge: 'VÍTIMA', secretRole: 'NORMAL' },
  { id: 'p6', name: 'GHOST_DEV', avatar: '(-_-)', color: '#9D4EDD', totalPoints: '900', badge: 'FANTASMA', secretRole: 'NORMAL' },
  { id: 'p7', name: 'CAOS_MAKER', avatar: '(@_@)', color: '#1C1C1C', totalPoints: '850', badge: 'TROL', secretRole: 'INVERSOR' },
  { id: 'p8', name: 'LATE_USER', avatar: '(O_O)', color: '#888888', totalPoints: '400', badge: 'ATRASADO', secretRole: 'NORMAL' },
];

const MOCK_STATS = [
  { label: "AGENTE MAIS CAÓTICO", value: "FLAVIO_AXF", color: "#FF6B35" },
  { label: "SOFREU MAIS COM BUGS", value: "DUPLA_BACK", color: "#4D96FF" },
  { label: "MAIOR DIGITADOR", value: "RAUL_PARADEDA (142 CHAR)", color: "#FFD166" },
  { label: "MELHOR TROCADILHO", value: "AGENT_007", color: "#06D6A0" }
];

const MOCK_WORDS = ['GAMBIARRA (x8)', 'CAOS (x5)', 'FIREWALL (x4)', 'SISTEMA (x3)', 'TELÃO (x2)', 'BUG (x2)'];

const FAKE_ADS = [
  { id: 'ad1', title: 'HOT_SINGLES.EXE', imgSrc: '/ad1.jpg', top: '15%', left: '25%' },
  { id: 'ad2', title: 'DOWNLOAD_RAM.BAT', imgSrc: '/ad2.jpg', top: '50%', left: '60%' },
  { id: 'ad3', title: 'URGENTE_ANTIVIRUS.EXE', imgSrc: '/ad3.jpg', top: '35%', left: '45%' },
];

const CHAOS_CHARS = ['{', '}', ';', '/', '!', '@', '#', '>', '<', '*', '&', '%', '?', '1', '0'];

export default function TelaoFinalResultsScreen({
  theme = "GRUPO DA EMPRESA",
  playersRanked = [], 
  onMainMenu,
  onPlayAgain
}: TelaoFinalResultsScreenProps) {
  
  const [phase, setPhase] = useState<ResultsPhase>('PRINTING_REPORT');
  const [printProgress, setPrintProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0); 
  
  const [mousePos, setMousePos] = useState({ top: '120%', left: '50vw' });
  const [openedFiles, setOpenedFiles] = useState<string[]>([]);
  const [closedAds, setClosedAds] = useState<string[]>([]);
  const [animatedPoints, setAnimatedPoints] = useState<Record<string, number>>({});
  
  const [currentStat, setCurrentStat] = useState(0);

  const activePlayers = playersRanked.length > 0 ? playersRanked : MOCK_PLAYERS;
  
  const top1 = activePlayers[0] || null;
  const top2 = activePlayers[1] || null;
  const top3 = activePlayers[2] || null;
  const remnants = activePlayers.slice(3);

  // CONGELA A CHUVA DE CARACTERES: Evita o bug de re-renderização do React
  const chaosRainConfig = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      char: CHAOS_CHARS[Math.floor(Math.random() * CHAOS_CHARS.length)],
      left: `${Math.random() * 100}%`,
      duration: `${4 + Math.random() * 6}s`, // Queda suave entre 4s e 10s
      delay: `-${Math.random() * 5}s`, 
      fontSize: `${1.5 + Math.random() * 1.5}rem`,
      color: Math.random() > 0.6 ? '#FF6B35' : '#555555' // Laranja ou Cinza escuro para não ofuscar
    }));
  }, []);

  // LINHA DO TEMPO
  useEffect(() => {
    if (phase === 'PRINTING_REPORT') {
      const duration = 4000; 
      const stepTime = duration / 100;
      const progressTimer = setInterval(() => setPrintProgress(prev => (prev >= 100 ? 100 : prev + 1)), stepTime);
      const phraseTimer = setInterval(() => setLoadingStep(prev => (prev < 3 ? prev + 1 : prev)), 900);
      const endTimer = setTimeout(() => {
        clearInterval(progressTimer); clearInterval(phraseTimer); setPhase('FILE_EXPLORER');
      }, duration + 500);
      return () => { clearInterval(progressTimer); clearInterval(phraseTimer); clearTimeout(endTimer); };
    }
    
    if (phase === 'FILE_EXPLORER') {
      const runExplorer = async () => {
        const wait = (ms: number) => new Promise(res => setTimeout(res, ms));
        await wait(1000);
        
        // Abre 3º
        setMousePos({ top: 'calc(50vh - 10px)', left: 'calc(50vw + 284px)' });
        await wait(600); setOpenedFiles(prev => [...prev, '3']); await wait(1000);

        // Abre 2º
        setMousePos({ top: 'calc(50vh - 10px)', left: 'calc(50vw - 284px)' });
        await wait(600); setOpenedFiles(prev => [...prev, '2']); await wait(1000);

        // Abre 1º
        setMousePos({ top: 'calc(50vh - 10px)', left: '50vw' });
        await wait(600); setOpenedFiles(prev => [...prev, '1']);
        setPhase('REVEAL_1ST_AND_ADS');
      };
      runExplorer();
    }

    if (phase === 'REVEAL_1ST_AND_ADS') {
      const runAdsCleanup = async () => {
        const wait = (ms: number) => new Promise(res => setTimeout(res, ms));
        await wait(1500); 
        for (let ad of [...FAKE_ADS].reverse()) {
          setMousePos({ top: `calc(${ad.top} + 12px)`, left: `calc(${ad.left} + 265px)` });
          await wait(450); setClosedAds(prev => [...prev, ad.id]); await wait(100); 
        }
        setMousePos({ top: '120%', left: '120%' });
        await wait(5000); 
        setPhase('FINAL_SUMMARY');
      };
      runAdsCleanup();
    }
  }, [phase]);

  // Rotação de Curiosidades no Dossiê
  useEffect(() => {
    if (phase === 'FINAL_SUMMARY') {
      const interval = setInterval(() => {
        setCurrentStat(prev => (prev + 1) % MOCK_STATS.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  // Contagem Animada de Pontos
  useEffect(() => {
    if ((phase === 'FILE_EXPLORER' || phase === 'REVEAL_1ST_AND_ADS') && activePlayers.length > 0) {
      const timers = activePlayers.map((player) => {
        if (!player) return null;
        const target = parseInt(player.totalPoints.replace('.', ''), 10) || 0;
        let start = 0;
        const stepTime = Math.max(Math.floor(1500 / (target / 50)), 15);
        return setInterval(() => {
          start += Math.ceil(target / 20);
          if (start >= target) { start = target; }
          setAnimatedPoints(prev => ({ ...prev, [player.id]: start }));
        }, stepTime);
      });
      return () => timers.forEach(t => t && clearInterval(t));
    }
  }, [phase, activePlayers]);

  const handleRestoreSecurity = () => {
    setPhase('RESTORE_SECURITY');
    setTimeout(() => { if (onMainMenu) onMainMenu(); }, 3500);
  };

  const handleHackAgain = () => {
    setPhase('HACKING_NEW_TARGET');
    setTimeout(() => { if (onPlayAgain) onPlayAgain(); }, 3500);
  };

  return (
    <main className="h-screen w-screen bg-[#EDEBE5] text-[#1C1C1C] flex flex-col font-sans select-none relative overflow-hidden transition-colors duration-700">
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        .font-pixel { font-family: 'VT323', monospace !important; }
        
        .bg-desktop {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(28, 28, 28, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(28, 28, 28, 0.05) 1px, transparent 1px);
        }

        .shadow-hard { box-shadow: 10px 10px 0px #1C1C1C; }
        .shadow-champ { box-shadow: 16px 16px 0px #FF6B35; }

        @keyframes window-pop { 0% { transform: scale(0.9) translateY(20px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
        .animate-window { animation: window-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1) forwards; }
        
        @keyframes adware-pop { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-adware { animation: adware-pop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.2) forwards; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }

        /* Chuva corrigida: Suave, contínua e indo ate o final da janela */
        @keyframes matrix-rain { 
          0% { transform: translateY(-50px); opacity: 0; } 
          10% { opacity: 0.5; }
          80% { opacity: 0.5; }
          100% { transform: translateY(800px); opacity: 0; } 
        }
        .animate-matrix { animation: matrix-rain linear infinite; }
        
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 25s linear infinite; display: flex; white-space: nowrap; }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes fill-bar { 0% { width: 0%; } 100% { width: 100%; } }
        .animate-fill-bar { animation: fill-bar 2.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards 0.5s; }

        @keyframes typing-cmd { from { max-width: 0; } to { max-width: 100%; } }
        .animate-typing-cmd { animation: typing-cmd 1.5s steps(40, end) forwards; overflow: hidden; white-space: nowrap; }
      `}} />

      {/* BACKGROUND GLOBAL */}
      <div className="absolute inset-0 bg-desktop pointer-events-none z-0"></div>

      {/* =========================================================================
          ATO 1: IMPRESSÃO (CARREGAMENTO SEQUENCIAL)
          ========================================================================= */}
      {phase === 'PRINTING_REPORT' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-8 animate-fade-in">
          <div className="w-full max-w-2xl bg-[#EDEBE5] border-[6px] border-[#1C1C1C] rounded-[4px] p-10 font-pixel text-[#1C1C1C] shadow-hard">
            <h2 className="text-[#FF6B35] text-4xl mb-8 uppercase tracking-widest border-b-[4px] border-[#1C1C1C] pb-4">
              [ TERMINAL DE APURAÇÃO ]
            </h2>
            
            <div className="space-y-6 text-3xl font-bold mb-12 h-48">
              <div className={`transition-opacity duration-300 ${loadingStep >= 0 ? 'opacity-100' : 'opacity-0'}`}>
                &gt; Validando logs da rodada...
              </div>
              <div className={`transition-opacity duration-300 ${loadingStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                &gt; Verificando identidades secretas...
              </div>
              <div className={`transition-opacity duration-300 ${loadingStep >= 2 ? 'opacity-100 text-[#C8381E]' : 'opacity-0'}`}>
                &gt; Calculando penalidades de formatação...
              </div>
              <div className={`transition-opacity duration-300 ${loadingStep >= 3 ? 'opacity-100 animate-pulse' : 'opacity-0'}`}>
                &gt; COMPILANDO RANKING OFICIAL...
              </div>
            </div>

            <div className="w-full h-10 bg-[#D0CEC8] border-[4px] border-[#1C1C1C] overflow-hidden rounded-[4px]">
              <div className="h-full bg-[#FF6B35] transition-all duration-100" style={{ width: `${printProgress}%` }}></div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ATO 2 e 3: EXPLORADOR, PÓDIO E ADS
          ========================================================================= */}
      {(phase === 'FILE_EXPLORER' || phase === 'REVEAL_1ST_AND_ADS') && (
        <div className="absolute inset-0 z-10 flex flex-col p-8 pb-0 animate-fade-in">
          
          <div className="w-full flex justify-between items-center z-10">
             <div className="font-pixel text-3xl font-bold uppercase tracking-widest bg-[#1C1C1C] text-[#F7F5F0] px-6 py-2 border-[4px] border-[#1C1C1C] shadow-hard">
               TEMA: {theme}
             </div>
             <div className="font-pixel text-2xl uppercase tracking-widest bg-[#FF6B35] text-[#1C1C1C] px-6 py-2 border-[4px] border-[#1C1C1C] shadow-hard font-bold">
               SISTEMA_SALVO.EXE
             </div>
          </div>

          {/* O Explorador Central */}
          <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[850px] max-w-[95vw] bg-[#EDEBE5] border-[6px] border-[#1C1C1C] shadow-hard flex flex-col z-20 h-[450px]">
             <div className="bg-[#1C1C1C] text-[#F7F5F0] px-4 py-2 flex justify-between items-center font-pixel border-b-[6px] border-[#1C1C1C]">
               <span className="text-2xl tracking-widest">C:\SISTEMA\RANKING_FINAL</span>
               <div className="w-6 h-6 bg-[#EDEBE5] border-[2px] border-[#1C1C1C] flex items-center justify-center text-[#1C1C1C] font-bold text-sm">X</div>
             </div>
             
             <div className="flex-1 flex justify-around items-center p-8 bg-[#D0CEC8]">
                <div className={`flex flex-col items-center gap-2 transition-opacity duration-300 ${openedFiles.includes('2') ? 'opacity-30' : 'opacity-100'}`}>
                  <div className="w-24 h-28 border-[6px] border-[#1C1C1C] bg-[#EDEBE5] flex items-center justify-center font-pixel text-5xl font-bold shadow-hard text-[#1C1C1C]">2</div>
                  <span className="font-pixel text-xl font-bold bg-[#1C1C1C] text-white px-2 mt-2">RANK_02.EXE</span>
                </div>
                <div className={`flex flex-col items-center gap-2 transition-opacity duration-300 ${openedFiles.includes('1') ? 'opacity-30' : 'opacity-100'}`}>
                  <div className="w-24 h-28 border-[6px] border-[#1C1C1C] bg-[#FF6B35] flex items-center justify-center font-pixel text-5xl font-bold shadow-hard text-[#1C1C1C]">1</div>
                  <span className="font-pixel text-xl font-bold bg-[#1C1C1C] text-white px-2 mt-2">RANK_01.EXE</span>
                </div>
                <div className={`flex flex-col items-center gap-2 transition-opacity duration-300 ${openedFiles.includes('3') ? 'opacity-30' : 'opacity-100'}`}>
                  <div className="w-24 h-28 border-[6px] border-[#1C1C1C] bg-[#EDEBE5] flex items-center justify-center font-pixel text-5xl font-bold shadow-hard text-[#1C1C1C]">3</div>
                  <span className="font-pixel text-xl font-bold bg-[#1C1C1C] text-white px-2 mt-2">RANK_03.EXE</span>
                </div>
             </div>
          </div>

          {/* JANELAS 3º E 2º LUGAR */}
          {openedFiles.includes('3') && top3 && (
            <div className="absolute right-[5%] bottom-[18%] w-80 bg-[#EDEBE5] border-[6px] border-[#1C1C1C] shadow-hard flex flex-col z-30 animate-window">
              <div className="bg-[#1C1C1C] text-[#F7F5F0] px-3 py-1 font-pixel border-b-[6px] border-[#1C1C1C] tracking-widest">RANK_03.EXE</div>
              <div className="p-6 flex flex-col items-center">
                <div className="font-pixel text-5xl mb-2" style={{ color: top3.color }}>{top3.avatar}</div>
                <div className="font-pixel text-2xl font-bold uppercase mb-2 truncate max-w-[200px]">{top3.name}</div>
                <div className="font-pixel text-3xl font-bold bg-[#1C1C1C] text-[#F7F5F0] px-6 py-1 border-[4px] border-[#1C1C1C]">{animatedPoints[top3.id] || 0} PTS</div>
              </div>
            </div>
          )}

          {openedFiles.includes('2') && top2 && (
            <div className="absolute left-[5%] bottom-[22%] w-80 bg-[#EDEBE5] border-[6px] border-[#1C1C1C] shadow-hard flex flex-col z-30 animate-window">
              <div className="bg-[#1C1C1C] text-[#F7F5F0] px-3 py-1 font-pixel border-b-[6px] border-[#1C1C1C] tracking-widest">RANK_02.EXE</div>
              <div className="p-6 flex flex-col items-center">
                <div className="font-pixel text-6xl mb-2" style={{ color: top2.color }}>{top2.avatar}</div>
                <div className="font-pixel text-3xl font-bold uppercase mb-2 truncate max-w-[200px]">{top2.name}</div>
                <div className="font-pixel text-4xl font-bold bg-[#1C1C1C] text-[#F7F5F0] px-6 py-1 border-[4px] border-[#1C1C1C]">{animatedPoints[top2.id] || 0} PTS</div>
              </div>
            </div>
          )}

          {/* JANELA 1º LUGAR E CHUVA DE CARACTERES FIXA */}
          {openedFiles.includes('1') && top1 && (
            <>
              <div className="absolute top-[48%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] bg-[#EDEBE5] border-[8px] border-[#1C1C1C] shadow-champ rounded-[4px] flex flex-col z-40 animate-window">
                <div className="bg-[#FF6B35] text-[#1C1C1C] px-4 py-3 flex justify-between items-center font-pixel border-b-[8px] border-[#1C1C1C] z-20 relative">
                  <span className="text-4xl font-bold tracking-widest">[!!! HACKER_SUPREMO.EXE !!!]</span>
                  <div className="w-8 h-8 bg-[#EDEBE5] border-[4px] border-[#1C1C1C] flex items-center justify-center font-bold text-xl">X</div>
                </div>
                
                <div className="relative p-12 flex flex-col items-center bg-[#1C1C1C] overflow-hidden min-h-[450px]">
                  
                  {/* A Chuva Contida no Fundo da Janela */}
                  <div className="absolute inset-0 z-0 pointer-events-none">
                    {chaosRainConfig.map((drop) => (
                      <div key={drop.id} className="absolute font-pixel font-bold animate-matrix"
                        style={{ 
                          left: drop.left, 
                          animationDuration: drop.duration, 
                          animationDelay: drop.delay, 
                          fontSize: drop.fontSize,
                          color: drop.color
                        }}>
                        {drop.char}
                      </div>
                    ))}
                  </div>

                  {/* Informações do Campeão Isoladas no Topo (z-10) */}
                  <div className="font-pixel text-[9rem] mb-6 filter drop-shadow-[8px_8px_0px_#000] relative z-10" style={{ color: top1.color }}>
                    {top1.avatar}
                  </div>
                  <div className="font-pixel text-6xl font-bold uppercase mb-6 bg-[#EDEBE5] text-[#1C1C1C] px-8 py-2 border-[4px] border-[#1C1C1C] text-center w-full truncate relative z-10">
                    {top1.name}
                  </div>
                  <div className="font-pixel text-[5rem] font-bold text-[#FF6B35] bg-[#1C1C1C] px-8 py-2 border-[4px] border-[#FF6B35] relative z-10 shadow-[4px_4px_0px_#000]">
                    {animatedPoints[top1.id] || 0} PTS
                  </div>
                </div>
              </div>

              {/* O ATAQUE DOS ADS */}
              {phase === 'REVEAL_1ST_AND_ADS' && (
                <div className="absolute inset-0 z-50 pointer-events-none">
                  {FAKE_ADS.map((ad, i) => !closedAds.includes(ad.id) && (
                    <div key={ad.id} className="absolute w-72 bg-[#C0C0C0] border-t-[4px] border-l-[4px] border-t-white border-l-white border-b-[4px] border-r-[4px] border-b-black border-r-black shadow-hard animate-adware flex flex-col pointer-events-auto"
                      style={{ top: ad.top, left: ad.left, animationDelay: `${i * 100}ms` }}>
                      <div className="bg-[#000080] text-white font-pixel px-2 py-1 flex justify-between items-center text-xl tracking-widest shrink-0">
                        <span>{ad.title}</span>
                        <div className="bg-[#C0C0C0] text-black border-[1px] border-t-white border-l-white border-b-black border-r-black w-6 h-6 flex items-center justify-center font-bold pb-1 text-[10px] cursor-pointer">X</div>
                      </div>
                      <div className="flex-1 bg-black flex items-center justify-center overflow-hidden border-[4px] border-t-black border-l-black border-b-white border-r-white m-1 p-1">
                        <img src={ad.imgSrc} alt={ad.title} className="w-full h-auto object-cover" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300x150?text=IMG_ERROR'; }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* MOUSE CAÇADOR GLOBAL */}
          {(phase === 'FILE_EXPLORER' || phase === 'REVEAL_1ST_AND_ADS') && (
            <div className="absolute z-[9999] transition-all duration-[450ms] ease-out pointer-events-none" style={{ top: mousePos.top, left: mousePos.left }}>
              <svg width="40" height="60" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(6px 6px 0px rgba(28,28,28,1))' }}>
                <path d="M1 1L1 26L8 20L13 32L17 30L12 18L21 18L1 1Z" fill="#F7F5F0" stroke="#1C1C1C" strokeWidth="2"/>
              </svg>
            </div>
          )}
        </div>
      )}

      {/* BARRA INFERIOR DE AGENTES */}
      {(phase === 'FILE_EXPLORER' || phase === 'REVEAL_1ST_AND_ADS') && remnants.length > 0 && (
        <div className="absolute bottom-0 inset-x-0 h-16 bg-[#1C1C1C] border-t-[6px] border-[#FF6B35] z-[45] flex items-center overflow-hidden">
          <div className="bg-[#FF6B35] text-[#1C1C1C] font-pixel text-2xl font-bold h-full flex items-center px-8 border-r-[6px] border-[#1C1C1C] shrink-0 z-20 tracking-widest uppercase">
            OUTROS AGENTES &gt;&gt;
          </div>
          <div className="flex-1 overflow-hidden relative h-full flex items-center">
            <div className="animate-marquee flex gap-16 font-pixel text-2xl text-[#F7F5F0] pl-12">
              {[...remnants, ...remnants, ...remnants].map((r, i) => (
                <div key={`${r.id}-${i}`} className="flex gap-4 items-center whitespace-nowrap">
                  <span className="text-[#888]">#{r.id === 'p1' ? '' : i % remnants.length + 4}</span>
                  <span style={{ color: r.color }}>{r.avatar}</span>
                  <span className="uppercase">{r.name}</span>
                  <span className="text-[#FF6B35]">{r.totalPoints} PTS</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ATO 4: DOSSIÊ FINAL (Design Estático e Limpo)
          ========================================================================= */}
      {phase === 'FINAL_SUMMARY' && (
        <div className="absolute inset-0 z-[200] bg-[#EDEBE5] flex flex-col p-6 md:p-10 animate-fade-in h-screen">
          
          <header className="shrink-0 w-full bg-[#1C1C1C] border-[6px] border-[#1C1C1C] rounded-[4px] px-8 py-4 shadow-hard text-center mb-8 z-20">
            <h1 className="font-pixel text-[#FF6B35] text-5xl uppercase tracking-[0.2em]">// DOSSIÊ DE INVASÃO ENCERRADO</h1>
          </header>

          <main className="flex-1 flex gap-8 w-full max-w-7xl mx-auto min-h-0 mb-8">
            
            {/* PAINEL ESQUERDO: Identidades */}
            <div className="flex-[3] bg-[#EDEBE5] border-[6px] border-[#1C1C1C] rounded-[4px] shadow-hard flex flex-col min-h-0 overflow-hidden">
              <h2 className="shrink-0 font-pixel text-[#1C1C1C] text-3xl font-bold uppercase tracking-widest bg-[#EDEBE5] p-4 border-b-[6px] border-[#1C1C1C]">
                IDENTIDADE DOS AGENTES
              </h2>
              <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  {activePlayers.map((player) => (
                    <div key={player.id} className="bg-[#1C1C1C] border-[4px] border-[#1C1C1C] p-3 flex flex-col justify-between rounded-[4px] shadow-sm">
                      <div className="flex items-center gap-3 border-b-[2px] border-[#333] pb-2 mb-2">
                        <span className="font-pixel text-4xl" style={{ color: player.color }}>{player.avatar}</span>
                        <span className="font-pixel text-xl uppercase text-[#F7F5F0] font-bold truncate">{player.name}</span>
                      </div>
                      <div className="flex justify-between items-end mt-1">
                        <span className="font-pixel text-xs text-[#888] tracking-widest uppercase">Papel Secreto:</span>
                        <span className="font-pixel text-lg text-[#1C1C1C] font-bold uppercase bg-[#FF6B35] px-2">{player.secretRole || 'NORMAL'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PAINEL DIREITO: Curiosidades Rotativas e Palavras Estáticas */}
            <div className="flex-[2] bg-[#1C1C1C] border-[6px] border-[#1C1C1C] rounded-[4px] shadow-hard flex flex-col min-h-0 overflow-hidden relative">
              <h2 className="shrink-0 font-pixel text-[#F7F5F0] text-3xl font-bold uppercase tracking-widest bg-[#1C1C1C] p-4 border-b-[6px] border-[#333] z-10 flex justify-between">
                <span>CURIOSIDADES_</span>
                <span className="text-[#06D6A0] animate-pulse text-xl mt-1">LIVE</span>
              </h2>
              
              {/* Curiosidade Rotativa */}
              <div className="h-48 bg-[#111] flex flex-col items-center justify-center p-6 border-b-[4px] border-dashed border-[#333] shrink-0">
                 <div key={currentStat} className="animate-fade-in flex flex-col items-center text-center">
                   <span className="font-pixel text-[#888] text-xl tracking-widest uppercase mb-2">-- {MOCK_STATS[currentStat].label} --</span>
                   <span className="font-pixel text-4xl font-bold uppercase" style={{ color: MOCK_STATS[currentStat].color }}>{MOCK_STATS[currentStat].value}</span>
                 </div>
              </div>
              
              {/* Palavras Mais Votadas Estáticas */}
              <div className="flex-1 bg-[#0A0A0A] p-6 flex flex-col items-center overflow-y-auto no-scrollbar">
                <div className="text-2xl text-[#06D6A0] mb-6 uppercase font-pixel tracking-widest">-- TERMOS MAIS INFECTADOS --</div>
                <div className="flex flex-wrap justify-center gap-4 max-w-lg">
                  {MOCK_WORDS.map((word, i) => (
                    <div key={i} className="font-pixel text-2xl text-[#F7F5F0] bg-[#1C1C1C] border-[4px] border-[#333] px-4 py-2 shadow-sm">{word}</div>
                  ))}
                </div>
              </div>
            </div>
          </main>

          {/* BOTÕES DE AÇÃO LARGOS NO RODAPÉ */}
          <footer className="shrink-0 w-full flex justify-center gap-8 z-30 pointer-events-auto h-20">
            <button onClick={handleRestoreSecurity} className="flex-1 max-w-xl bg-[#EDEBE5] text-[#1C1C1C] border-[6px] border-[#1C1C1C] h-full font-pixel text-3xl uppercase tracking-widest font-bold hover:bg-[#1C1C1C] hover:text-[#EDEBE5] shadow-hard transition-all active:translate-y-1 active:shadow-sm">
              [ RESTAURAR SEGURANÇA ]
            </button>
            <button onClick={handleHackAgain} className="flex-1 max-w-xl bg-[#FF6B35] text-[#1C1C1C] border-[6px] border-[#1C1C1C] h-full font-pixel text-3xl uppercase tracking-widest font-bold hover:bg-[#1C1C1C] hover:text-[#FF6B35] shadow-hard transition-all active:translate-y-1 active:shadow-sm">
              &gt; INVADIR OUTRO TERMINAL
            </button>
          </footer>
        </div>
      )}

      {/* =========================================================================
          ATO 5: ANIMAÇÕES DE SAÍDA OFICIAIS
          ========================================================================= */}
      
      {/* RESTAURAR SEGURANÇA */}
      {phase === 'RESTORE_SECURITY' && (
        <div className="absolute inset-0 z-[500] bg-[#1C1C1C] flex flex-col items-center justify-center animate-fade-in p-8">
          <div className="w-full max-w-4xl bg-[#EDEBE5] border-[8px] border-[#1C1C1C] p-12 shadow-[16px_16px_0px_#06D6A0] flex flex-col">
            <h2 className="font-pixel text-[#1C1C1C] text-5xl md:text-6xl tracking-[0.1em] font-bold mb-10 border-b-[8px] border-[#1C1C1C] pb-6 uppercase text-center">
              RESTAURANDO INTEGRIDADE_
            </h2>
            <div className="w-full h-24 border-[8px] border-[#1C1C1C] p-2 bg-[#D0CEC8] shadow-[12px_12px_0px_#1C1C1C] mb-8">
               <div className="h-full bg-[#06D6A0] animate-fill-bar w-0 flex items-center justify-end pr-4">
                 <span className="font-pixel text-[#1C1C1C] text-3xl font-bold animate-pulse">OK_</span>
               </div>
            </div>
            <p className="font-pixel text-[#1C1C1C] text-3xl mt-4 uppercase text-center font-bold tracking-widest">
              Expurgando malwares e retornando ao menu...
            </p>
          </div>
        </div>
      )}

      {/* INVADIR NOVO TERMINAL */}
      {phase === 'HACKING_NEW_TARGET' && (
        <div className="absolute inset-0 z-[500] bg-[#1C1C1C] flex flex-col items-center justify-center animate-fade-in p-8">
          <div className="max-w-4xl w-full font-pixel text-[#F7F5F0] text-5xl leading-relaxed z-10 p-12 border-l-[12px] border-[#FF6B35] bg-[#0A0A0A] shadow-[16px_16px_0px_#FF6B35]">
            <p className="opacity-60 mb-6 font-bold">&gt; SSH ROOT@NOVO-ALVO.LOCAL</p>
            <p className="mb-6 overflow-hidden whitespace-nowrap animate-typing-cmd border-r-[4px] border-[#FF6B35] pr-2 text-[#C8381E] font-bold">
              &gt; INICIANDO FORÇA BRUTA...
            </p>
            <div className="mt-12 bg-[#FF6B35] text-[#1C1C1C] border-[6px] border-[#1C1C1C] px-8 py-4 inline-block shadow-[8px_8px_0px_#1C1C1C] animate-pulse">
              <span className="text-6xl md:text-[5rem] font-bold tracking-widest">&gt; ACCESS GRANTED.</span>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}