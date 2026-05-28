'use client';
import React, { useState, useEffect, useRef } from 'react';

interface MobileGameScreenProps {
  playerName?: string;
  avatar?: string;
  theme?: string;
  roleColor?: string;
  initialContext?: string; 
  activeTeam?: string; 
  playerTeam?: string; 
  role?: 'NORMAL' | 'HACKEADO' | 'INVERSOR' | 'BEBADO' | 'MANDARIM';
  phase?: 'PREPARE' | 'TYPING' | 'LOCK'; 
  onCursorMove?: (cursorPosition: number) => void; 
  onRealTimeUpdate?: (delta: string, cursorPosition: number) => void; // MODIFICADO: Espera o Delta
}

export function GameScreen({
  playerName = 'HACKER_99',
  avatar = '(>_<)',
  theme = 'CIBERSEGURANÇA NA UERN',
  roleColor = '#06D6A0',
  initialContext = '',
  activeTeam = 'TIME_A',
  playerTeam = 'TIME_A',
  role = 'NORMAL',
  phase = 'PREPARE',
  onCursorMove,
  onRealTimeUpdate
}: MobileGameScreenProps) {
  
  const [currentText, setCurrentText] = useState(initialContext);
  const [isTyping, setIsTyping] = useState(false);
  const [baseInsertionIndex, setBaseInsertionIndex] = useState<number>(0);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const isMyTurn = playerTeam === activeTeam;

  // Garante que o rascunho do celular seja sempre o do telão quando a fase mudar
  useEffect(() => {
    setCurrentText(initialContext);
  }, [initialContext]);

  // CRAVA O PONTEIRO: Quando a fase muda para TYPING, salva onde o jogador deixou o cursor
  useEffect(() => {
    if (phase === 'TYPING' && textAreaRef.current) {
      const pos = textAreaRef.current.selectionStart || currentText.length;
      setBaseInsertionIndex(pos);
      if (onCursorMove) onCursorMove(pos);
      textAreaRef.current.focus();
    }
  }, [phase]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // PROTEÇÃO DA REGRA: Se tentar apagar algo antes de onde travou no Prepare, o teclado barra
    if (phase === 'TYPING' && (e.key === 'Backspace' || e.key === 'Delete')) {
      if (textAreaRef.current && textAreaRef.current.selectionStart <= baseInsertionIndex) {
        e.preventDefault();
      }
    }
  };

  const handleSelect = () => {
    if (!textAreaRef.current || !isMyTurn) return;
    
    // Deixa o cara clicar à vontade na fase de preparação
    if (phase === 'PREPARE' && onCursorMove) {
      onCursorMove(textAreaRef.current.selectionStart);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (phase !== 'TYPING' || !isMyTurn) return;

    const newText = e.target.value;
    const newPos = e.target.selectionStart;
    
    // Impede o cara de selecionar o texto todo e apagar com uma letra nova
    if (newText.length < currentText.length && newPos < baseInsertionIndex) {
        return;
    }

    setIsTyping(true);

    // MÁGICA DO DELTA: Acha qual letra nova o cara digitou (para a sua hook que aceita string delta)
    const diffLen = newText.length - currentText.length;
    
    if (diffLen > 0) {
      let delta = newText.slice(newPos - diffLen, newPos);
      
      // EFEITO DO CAOS: H4ck3ad0 (Infecta apenas a letra nova)
      if (role === 'HACKEADO') {
        const glitches = ['!', '1', '0', '?'];
        delta = glitches[Math.floor(Math.random() * glitches.length)];
      }

      // Envia só o Delta e a posição onde injetar
      if (onRealTimeUpdate) onRealTimeUpdate(delta, newPos - diffLen);
    }

    setCurrentText(newText);
    if (onCursorMove) onCursorMove(newPos);
    
    setTimeout(() => setIsTyping(false), 250);
  };

  return (
    <main className="h-[100dvh] w-full bg-[#EDEBE5] text-[#1C1C1C] flex flex-col font-sans p-4 sm:p-5 overflow-hidden select-none relative">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=VT323&display=swap');
        .font-pixel { font-family: 'VT323', monospace !important; }
        .shadow-hard { box-shadow: 4px 4px 0px #1C1C1C; }
        .rounded-brutalist { border-radius: 8px !important; }
      `}} />

      {/* MODO ESPECTADOR (Para quem não digita nesse round) */}
      {!isMyTurn && (
        <div className="absolute inset-0 bg-black/95 z-[999] flex flex-col items-center justify-center p-6 text-center">
          <div className="font-pixel text-[#C8381E] text-5xl uppercase animate-pulse mb-4">[ CANAL EM LEITURA ]</div>
          <p className="font-pixel text-[#F7F5F0] text-2xl uppercase max-w-xs tracking-wider">
            Sua equipe ({playerTeam}) está aguardando o {activeTeam} terminar a injeção do rascunho. Observe o telão!
          </p>
        </div>
      )}

      <header className="w-full shrink-0 flex justify-between items-center bg-[#1C1C1C] text-[#F7F5F0] px-3 py-2 border-[3px] border-[#1C1C1C] shadow-hard rounded-brutalist mb-4">
        <span className="font-pixel text-lg truncate uppercase">ALVO: {theme}</span>
        <div className="px-2 font-pixel text-lg rounded-[4px] bg-[#FF6B35] text-[#1C1C1C] uppercase tracking-wider">{phase}</div>
      </header>

      <div className="shrink-0 flex items-center justify-between border-[3px] border-[#1C1C1C] bg-[#F7F5F0] p-2.5 shadow-hard rounded-brutalist mb-4 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-2.5" style={{ backgroundColor: roleColor }}></div>
        <div className="pl-4 font-pixel text-xl uppercase font-bold text-[#1C1C1C] truncate">{playerName} ({playerTeam})</div>
        <div className="font-pixel text-4xl" style={{ color: roleColor }}>
          {isTyping ? avatar.replace(/_|-/g, 'O') : avatar}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col relative">
        <div className={`absolute -top-2.5 left-4 border-[3px] border-[#1C1C1C] px-2.5 py-0.5 font-pixel text-lg z-10 rounded-[4px] transition-colors
          ${phase === 'PREPARE' ? 'bg-[#06D6A0] text-[#1C1C1C]' : 'bg-[#FF6B35] text-[#1C1C1C]'}`}>
          {phase === 'PREPARE' ? 'TOQUE PARA ESCOLHER SEU LUGAR' : 'DIGITE A SUA MODIFICAÇÃO'}
        </div>
        
        <textarea
          ref={textAreaRef}
          value={currentText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
          onClick={handleSelect}
          onTouchEnd={handleSelect}
          readOnly={phase === 'PREPARE'} // Deixa readonly no prepare pra ele focar só na seleção, mas poder clicar
          className="flex-1 w-full bg-[#1C1C1C] text-[#FF6B35] border-[4px] border-[#1C1C1C] rounded-brutalist p-4 pt-6 font-pixel text-2xl uppercase outline-none focus:shadow-hard transition-all resize-none"
        />
      </div>
    </main>
  );
}