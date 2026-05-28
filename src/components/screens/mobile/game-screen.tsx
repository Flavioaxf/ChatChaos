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
  role?: string | null;
  phase?: 'PREPARE' | 'TYPING' | 'LOCK' | 'WAITING_FOR_ROUND';
  onCursorMove?: (cursorPosition: number) => void;
  onRealTimeUpdate?: (currentText: string, cursorPosition: number) => void;
}

export function GameScreen({
  playerName = 'HACKER_99',
  avatar = '(>_<)',
  theme = 'SISTEMA',
  roleColor = '#06D6A0',
  initialContext = '',
  activeTeam = 'TIME_A',
  playerTeam = 'TIME_A',
  role = null,
  phase = 'PREPARE',
  onCursorMove,
  onRealTimeUpdate,
}: MobileGameScreenProps) {

  const [currentText, setCurrentText] = useState(initialContext);
  const [isTyping, setIsTyping] = useState(false);
  const [cursorIndex, setCursorIndex] = useState(0);
  const [baseInsertionIndex, setBaseInsertionIndex] = useState(0);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const textDisplayRef = useRef<HTMLDivElement>(null);

  const isMyTurn = playerTeam === activeTeam;

  useEffect(() => {
    setCurrentText(initialContext);
    setCursorIndex(initialContext?.length ?? 0);
  }, [initialContext]);

  useEffect(() => {
    if (phase === 'TYPING' && isMyTurn) {
      setBaseInsertionIndex(cursorIndex);
      setTimeout(() => textAreaRef.current?.focus(), 100);
    }
  }, [phase, isMyTurn]);

  const handleTextTap = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (phase !== 'PREPARE' || !isMyTurn) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    let charIndex = currentText.length;

    if ((document as any).caretPositionFromPoint) {
      const pos = (document as any).caretPositionFromPoint(clientX, clientY);
      if (pos) charIndex = pos.offset;
    } else if ((document as any).caretRangeFromPoint) {
      const range = (document as any).caretRangeFromPoint(clientX, clientY);
      if (range) charIndex = range.startOffset;
    }

    const safeIndex = Math.max(0, Math.min(charIndex, currentText.length));
    setCursorIndex(safeIndex);

    if (onCursorMove) onCursorMove(safeIndex);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (phase === 'TYPING' && (e.key === 'Backspace' || e.key === 'Delete')) {
      if (cursorIndex <= baseInsertionIndex) {
        e.preventDefault();
        return;
      }
      setCursorIndex(prev => Math.max(baseInsertionIndex, prev - 1));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (phase !== 'TYPING' || !isMyTurn) return;

    const newText = e.target.value;
    const newPos = e.target.selectionStart ?? newText.length;

    setIsTyping(true);
    setCurrentText(newText);
    setCursorIndex(newPos);

    if (onRealTimeUpdate) onRealTimeUpdate(newText, newPos);
    setTimeout(() => setIsTyping(false), 250);
  };

  const renderTextWithCursor = () => {
    const before = currentText.slice(0, cursorIndex);
    const after = currentText.slice(cursorIndex);
    return (
      <>
        <span>{before}</span>
        <span
          className="inline-block w-[3px] h-[1.2em] align-middle animate-blink"
          style={{ backgroundColor: roleColor, marginLeft: '1px', marginRight: '1px' }}
        />
        <span>{after}</span>
      </>
    );
  };

  if (!isMyTurn) {
    return (
      <main className="h-[100dvh] w-full bg-[#1C1C1C] text-[#F7F5F0] flex flex-col items-center justify-center p-6 select-none">
        <style dangerouslySetInnerHTML={{__html: `
          @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
          .font-pixel { font-family: 'VT323', monospace !important; }
          @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
          .animate-blink { animation: blink 0.8s step-end infinite; }
          @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
          .animate-scan { animation: scan 3s linear infinite; }
        `}} />
        <div className="w-full max-w-sm flex flex-col items-center gap-6">
          <div className="border-4 border-[#C8381E] p-6 bg-[#0A0A0A] shadow-[8px_8px_0px_#C8381E] rounded-[8px] w-full text-center">
            <h2 className="font-pixel text-[#C8381E] text-3xl uppercase mb-3 animate-pulse">
              [ CANAL EM LEITURA ]
            </h2>
            <p className="font-pixel text-[#F7F5F0] text-xl uppercase tracking-wider leading-relaxed">
              Sua equipe ({playerTeam}) está em stand-by. Observe o Telão!
            </p>
          </div>
          <div className="w-full border border-[#333] bg-[#0A0A0A] p-4 max-h-48 overflow-auto relative">
            <div className="absolute w-full h-[1px] bg-[#FF6B35] opacity-10 animate-scan pointer-events-none" />
            <p className="font-pixel text-[#FF6B35] text-lg leading-relaxed break-words uppercase">
              {currentText}
              <span className="animate-blink">_</span>
            </p>
          </div>
          <p className="font-pixel text-[#444] text-lg tracking-wider">
            AGUARDE SUA VEZ<span className="animate-blink">_</span>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-[100dvh] w-full bg-[#EDEBE5] text-[#1C1C1C] flex flex-col font-sans p-4 overflow-hidden select-none relative">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=VT323&display=swap');
        .font-pixel { font-family: 'VT323', monospace !important; }
        .shadow-hard { box-shadow: 4px 4px 0px #1C1C1C; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .animate-blink { animation: blink 0.8s step-end infinite; }
      `}} />

      <header className="w-full shrink-0 flex justify-between items-center bg-[#1C1C1C] text-[#F7F5F0] px-3 py-2 border-[3px] border-[#1C1C1C] shadow-hard rounded-[8px] mb-4">
        <span className="font-pixel text-lg truncate uppercase">ALVO: {theme}</span>
        <div className={`px-2 font-pixel text-lg rounded-[4px] uppercase tracking-wider ${
          phase === 'PREPARE' ? 'bg-[#06D6A0] text-[#1C1C1C]' :
          phase === 'TYPING' ? 'bg-[#FF6B35] text-[#1C1C1C]' :
          'bg-[#888888] text-[#F7F5F0]'
        }`}>
          {phase === 'PREPARE' ? 'PREPARAR' : phase === 'TYPING' ? 'DIGITANDO' : 'TRAVADO'}
        </div>
      </header>

      <div className="shrink-0 flex items-center justify-between border-[3px] border-[#1C1C1C] bg-[#F7F5F0] p-2.5 shadow-hard rounded-[8px] mb-4 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-2.5" style={{ backgroundColor: roleColor }} />
        <div className="pl-4 font-pixel text-xl uppercase font-bold text-[#1C1C1C] truncate">
          {playerName} ({playerTeam})
        </div>
        <div className="font-pixel text-4xl" style={{ color: roleColor }}>
          {isTyping ? avatar.replace(/[_\-]/g, 'O') : avatar}
        </div>
      </div>

      <div className={`shrink-0 mb-2 self-start border-[3px] border-[#1C1C1C] px-2.5 py-0.5 font-pixel text-lg rounded-[4px] ${
        phase === 'PREPARE' ? 'bg-[#06D6A0] text-[#1C1C1C]' : 'bg-[#FF6B35] text-[#1C1C1C]'
      }`}>
        {phase === 'PREPARE' ? 'TOQUE NO TEXTO PARA POSICIONAR SEU CURSOR' : 'MODIFIQUE A RESPOSTA'}
      </div>

      <div className="flex-1 min-h-0 relative">
        {phase === 'PREPARE' && (
          <div
            ref={textDisplayRef}
            onClick={handleTextTap}
            onTouchEnd={handleTextTap}
            className="w-full h-full bg-[#1C1C1C] text-[#FF6B35] border-[4px] border-[#1C1C1C] rounded-[8px] p-4 font-pixel text-2xl uppercase leading-relaxed overflow-auto cursor-text"
          >
            {renderTextWithCursor()}
          </div>
        )}

        {phase === 'TYPING' && (
          <textarea
            ref={textAreaRef}
            value={currentText}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-[#1C1C1C] text-[#FF6B35] border-[4px] border-[#1C1C1C] rounded-[8px] p-4 font-pixel text-2xl uppercase outline-none resize-none"
          />
        )}

        {phase === 'LOCK' && (
          <div className="w-full h-full bg-[#1C1C1C] text-[#888888] border-[4px] border-[#1C1C1C] rounded-[8px] p-4 font-pixel text-2xl uppercase leading-relaxed overflow-auto">
            {currentText}
          </div>
        )}
      </div>

      {phase === 'PREPARE' && (
        <div className="shrink-0 mt-3 border-[3px] border-[#06D6A0] bg-[#1C1C1C] p-3 text-center">
          <p className="font-pixel text-[#06D6A0] text-xl tracking-wider uppercase">
            POSIÇÃO ATUAL: CARACTERE {cursorIndex}
          </p>
        </div>
      )}
    </main>
  );
}