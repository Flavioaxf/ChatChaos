'use client';
import React, { useState, useEffect, useRef } from 'react';

interface MobileGameScreenProps {
  playerName?: string;
  avatar?: string;
  theme?: string;
  roleColor?: string;
  initialContext?: string;
  phase?: 'PREPARE' | 'TYPING'; // NOVA PROP: Controla o momento exato do jogo
  onCursorMove?: (cursorPosition: number) => void; // NOVA PROP: Avisa o Telão onde o jogador tocou
  onRealTimeUpdate?: (currentText: string, cursorPosition: number) => void;
}

export function GameScreen({
  playerName = 'HACKER_99',
  avatar = '(>_<)',
  theme = 'FESTA DA EMPRESA',
  roleColor = '#06D6A0',
  initialContext = 'TUDO COMEÇOU QUANDO ',
  phase = 'TYPING', // Padrão
  onCursorMove,
  onRealTimeUpdate
}: MobileGameScreenProps) {
  const [currentText, setCurrentText] = useState(initialContext);
  const [isTyping, setIsTyping] = useState(false);
  
  // Estados da Trava do Cursor
  const [isLocked, setIsLocked] = useState(false);
  const [lockIndex, setLockIndex] = useState<number>(0);
  
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const activeAvatar = isTyping ? avatar.replace(/_|-/g, 'O') : avatar;

  useEffect(() => {
    if (currentText.length > initialContext.length) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 200);
      return () => clearTimeout(timer);
    }
  }, [currentText, initialContext]);

  // Impede o apagar de caracteres
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
    }
  };

  // GERENCIADOR DE TOQUE E SELEÇÃO
  const handleSelect = () => {
    if (!textAreaRef.current) return;

    if (phase === 'PREPARE') {
      // Fase 1: Livre para escolher a posição. Dispara para o Firebase atualizar no Telão.
      if (onCursorMove) {
        onCursorMove(textAreaRef.current.selectionStart);
      }
    } else if (isLocked) {
      // Fase 2: O Caos. Se já digitou a primeira letra, o cursor está travado e não pode mais sair do lugar.
      textAreaRef.current.selectionStart = lockIndex;
      textAreaRef.current.selectionEnd = lockIndex;
    }
  };

  // GERENCIADOR DE DIGITAÇÃO EM TEMPO REAL
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Se por acaso conseguir digitar na fase de preparo (ex: teclado físico pareado), ignora
    if (phase === 'PREPARE') return; 

    const newText = e.target.value;

    if (!isLocked) {
      // Primeira letra digitada! Aciona a trava.
      setIsLocked(true);
      setLockIndex(e.target.selectionStart);
      setCurrentText(newText);
    } else {
      // Já está travado. Move o "cadeado" para frente conforme novas letras entram.
      const diff = newText.length - currentText.length;
      const newIndex = lockIndex + (diff > 0 ? diff : 0);
      setLockIndex(newIndex);
      setCurrentText(newText);
    }
    
    // Dispara a alteração para o Firebase
    if (onRealTimeUpdate && textAreaRef.current) {
      onRealTimeUpdate(newText, textAreaRef.current.selectionStart);
    }
  };

  return (
    <main className="h-[100dvh] w-full bg-[#EDEBE5] text-[#1C1C1C] flex flex-col font-sans p-4 sm:p-6 overflow-hidden select-none">
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=VT323&display=swap');
        .font-pixel { font-family: 'VT323', monospace !important; }
        .font-project-sans { font-family: 'DM Sans', sans-serif !important; }
        
        .shadow-hard { box-shadow: 4px 4px 0px #1C1C1C; }
        .rounded-brutalist { border-radius: 8px !important; }
        
        textarea::-webkit-scrollbar { display: none; }
        textarea { -ms-overflow-style: none; scrollbar-width: none; -webkit-tap-highlight-color: transparent; }
      `}} />

      {/* HEADER ENXUTO */}
      <header className="w-full shrink-0 flex justify-between items-center bg-[#1C1C1C] text-[#F7F5F0] px-3 py-2 border-[3px] border-[#1C1C1C] shadow-hard rounded-brutalist mb-4">
        <span className="font-pixel text-xl truncate pr-2 uppercase">TEMA: {theme}</span>
        <div className={`px-2 font-pixel text-xl rounded-[4px] ${phase === 'TYPING' ? 'bg-[#FF6B35] text-[#1C1C1C] animate-pulse' : 'bg-[#F7F5F0] text-[#1C1C1C]'}`}>
          {phase === 'TYPING' ? 'LIVE' : 'PREPARE'}
        </div>
      </header>

      {/* ÁREA DO AVATAR */}
      <div className="shrink-0 flex items-center justify-between border-[3px] sm:border-[4px] border-[#1C1C1C] bg-[#F7F5F0] p-3 shadow-hard rounded-brutalist mb-4 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-3" style={{ backgroundColor: roleColor }}></div>
        <div className="pl-4 font-pixel text-2xl uppercase font-bold tracking-widest text-[#1C1C1C] truncate">
          {playerName}
        </div>
        <div className={`font-pixel text-4xl sm:text-5xl transition-transform duration-75 ${isTyping ? 'scale-110' : 'scale-100'}`} style={{ color: roleColor }}>
          {activeAvatar}
        </div>
      </div>

      {/* ÁREA DE DIGITAÇÃO (Lida com PREPARE e TYPING) */}
      <div className="flex-1 min-h-0 flex flex-col relative">
        <div className={`absolute -top-3 left-4 border-[3px] border-[#1C1C1C] px-3 py-1 font-pixel text-xl z-10 rounded-[4px] transform -rotate-2 transition-colors
          ${phase === 'PREPARE' ? 'bg-[#06D6A0] text-[#1C1C1C] animate-pulse' : 'bg-[#FF6B35] text-[#1C1C1C]'}`}>
          {phase === 'PREPARE' ? 'POSICIONE O CURSOR' : 'INJETE O CÓDIGO'}
        </div>
        
        <textarea
          ref={textAreaRef}
          value={currentText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
          onClick={handleSelect}
          onTouchEnd={handleSelect} // Captura o toque de forma mais precisa em dispositivos móveis
          onPaste={(e) => e.preventDefault()}
          readOnly={phase === 'PREPARE'} // <--- O SEGREDO ESTÁ AQUI
          autoFocus={phase === 'TYPING'}
          className={`flex-1 w-full bg-[#1C1C1C] text-[#FF6B35] border-[4px] border-[#1C1C1C] rounded-brutalist p-5 pt-8 font-pixel text-3xl sm:text-4xl uppercase leading-relaxed outline-none focus:shadow-hard transition-all resize-none
            ${phase === 'PREPARE' ? 'opacity-80 cursor-crosshair' : 'opacity-100'}`}
        />
      </div>

    </main>
  );
}