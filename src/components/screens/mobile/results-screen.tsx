'use client';
import React from 'react';

interface MobileResultsScreenProps {
  playerName?: string;
  avatar?: string;
  role?: string;
  roleColor?: string;
  points?: number | string;
  position?: number | string; // Nova propriedade para a colocação no pódio
  badge?: string; // A conquista/título do jogador
  onReturnToLobby?: () => void;
}

export function ResultsScreen({
  playerName = 'HACKER_99',
  avatar = '(>_<)',
  role = 'SISTEMA HACKEADO',
  roleColor = '#C8381E',
  points = 4500,
  position = 3, // Padrão de teste: 3º Lugar
  badge = 'MASTER HACKER',
  onReturnToLobby
}: MobileResultsScreenProps) {

  // Formata a posição para exibir sempre com o símbolo de ordinal (ex: 1º)
  const formattedPosition = typeof position === 'number' ? `${position}º` : position;

  return (
    <main className="h-[100dvh] w-full bg-[#EDEBE5] text-[#1C1C1C] flex flex-col font-sans p-4 sm:p-6 overflow-hidden select-none justify-between">
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=VT323&display=swap');
        .font-pixel { font-family: 'VT323', monospace !important; }
        .font-project-sans { font-family: 'DM Sans', sans-serif !important; }
        
        .shadow-hard { box-shadow: 4px 4px 0px #1C1C1C; }
        .rounded-brutalist { border-radius: 6px !important; }
      `}} />

      {/* HEADER: Identificação */}
      <header className="w-full shrink-0 flex justify-between items-center bg-[#1C1C1C] text-[#F7F5F0] px-4 py-2.5 border-[3px] border-[#1C1C1C] shadow-hard rounded-brutalist mb-4">
        <span className="font-pixel text-xl sm:text-2xl truncate pr-2 uppercase">{playerName}</span>
        <span className="font-pixel text-2xl sm:text-3xl text-[#FF6B35]">{avatar}</span>
      </header>

      {/* ÁREA CENTRAL: Crachá de Resultados */}
      <div className="flex-1 flex flex-col min-h-0 justify-center w-full max-w-md mx-auto gap-4">
        
        {/* Título da Tela */}
        <div className="w-full bg-[#1C1C1C] border-[3px] border-[#1C1C1C] p-3 text-center rounded-brutalist transform -rotate-1 shadow-hard shrink-0 mb-1">
          <h2 className="font-pixel text-[#F7F5F0] text-2xl sm:text-3xl font-bold tracking-widest uppercase">
            DESEMPENHO FINAL_
          </h2>
        </div>

        {/* CRACHÁ BRUTALISTA */}
        <div className="flex-1 flex flex-col bg-[#F7F5F0] border-[4px] border-[#1C1C1C] rounded-brutalist shadow-hard p-4 sm:p-5 justify-between gap-4 min-h-0">
          
          {/* Linha 1: Papel Executado */}
          <div className="flex flex-col gap-1 border-b-[3px] border-[#1C1C1C] pb-3 shrink-0">
            <span className="font-pixel text-[#888] text-base sm:text-lg uppercase tracking-widest">PAPEL EXECUTADO:</span>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-[2px] border-[#1C1C1C] shrink-0" style={{ backgroundColor: roleColor }}></div>
              <span className="font-pixel text-2xl sm:text-3xl uppercase font-bold text-[#1C1C1C] truncate">
                {role}
              </span>
            </div>
          </div>

          {/* Linha 2: Posição e Pontuação (Lado a lado para economizar espaço e evitar scroll) */}
          <div className="flex-1 flex gap-3 min-h-0 items-stretch">
            
            {/* Bloco de Posição no Pódio */}
            <div className="flex-1 flex flex-col items-center justify-center bg-[#1C1C1C] border-[3px] border-[#1C1C1C] p-3 shadow-inner">
              <span className="font-pixel text-[#FF6B35] text-lg sm:text-xl uppercase tracking-widest mb-1 text-center">COLOCAÇÃO</span>
              <span className="font-pixel text-5xl sm:text-6xl text-[#F7F5F0] font-bold">
                {formattedPosition}
              </span>
            </div>

            {/* Bloco de Pontos Obtidos */}
            <div className="flex-1 flex flex-col items-center justify-center bg-[#1C1C1C] border-[3px] border-[#1C1C1C] p-3 shadow-inner">
              <span className="font-pixel text-[#06D6A0] text-lg sm:text-xl uppercase tracking-widest mb-1 text-center">PONTOS</span>
              <span className="font-pixel text-5xl sm:text-6xl text-[#F7F5F0] font-bold">
                {points}
              </span>
            </div>

          </div>

          {/* Linha 3: Título / Conquista Conquistada */}
          <div className="flex flex-col items-center pt-1 shrink-0">
            <span className="font-pixel text-[#888] text-base sm:text-lg uppercase tracking-widest mb-1">CONQUISTA DA RODADA:</span>
            <div className="bg-[#FF6B35] text-[#1C1C1C] border-[3px] border-[#1C1C1C] px-4 py-2 w-full text-center shadow-[4px_4px_0px_#1C1C1C] rounded-[4px]">
              <span className="font-pixel text-xl sm:text-2xl uppercase font-bold tracking-wider block truncate">
                {badge}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* RODAPÉ: Botão de Menu */}
      <div className="w-full shrink-0 mt-4">
        <button
          onClick={onReturnToLobby}
          className="w-full bg-[#1C1C1C] text-[#F7F5F0] border-[4px] border-[#1C1C1C] rounded-brutalist p-4 sm:p-5 font-pixel text-2xl sm:text-3xl uppercase tracking-widest font-bold shadow-hard transition-all active:translate-y-1 active:shadow-none hover:bg-[#FF6B35] hover:text-[#1C1C1C]"
        >
          [ Desconectar ]
        </button>
      </div>

    </main>
  );
}