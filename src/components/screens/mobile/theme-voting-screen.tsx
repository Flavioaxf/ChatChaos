'use client';
import React, { useState } from 'react';

interface ThemeVotingScreenProps {
  playerName?: string;
  avatar?: string;
  themes?: string[];
  onVoteTheme?: (theme: string) => void;
}

export function ThemeVotingScreen({
  playerName = 'HACKER_99',
  avatar = '(>_<)',
  // CORRIGIDO: Agora os temas batem 100% com o dicionário do Telão!
  themes = ['CIBERSEGURANÇA NA UERN', 'GESTÃO E PROTEÇÃO ANIMAL'],
  onVoteTheme
}: ThemeVotingScreenProps) {
  const [votedTheme, setVotedTheme] = useState<string | null>(null);

  const handleVote = (themeName: string) => {
    setVotedTheme(themeName);
    if (onVoteTheme) {
      onVoteTheme(themeName);
    }
  };

  return (
    <main className="h-[100dvh] w-full bg-[#EDEBE5] text-[#1C1C1C] flex flex-col font-sans p-4 sm:p-6 overflow-hidden select-none justify-between">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=VT323&display=swap');
        .font-pixel { font-family: 'VT323', monospace !important; }
        .font-project-sans { font-family: 'DM Sans', sans-serif !important; }
        .shadow-hard { box-shadow: 4px 4px 0px #1C1C1C; }
        .rounded-brutalist { border-radius: 8px !important; }
      `}} />

      <div className="w-full shrink-0 flex justify-between items-center bg-[#1C1C1C] text-[#F7F5F0] px-4 py-2.5 border-[3px] border-[#1C1C1C] shadow-hard rounded-brutalist">
        <span className="font-pixel text-xl sm:text-2xl truncate pr-2 uppercase">{playerName}</span>
        <span className="font-pixel text-2xl sm:text-3xl text-[#FF6B35]">{avatar}</span>
      </div>

      <div className="flex-1 mt-8 mb-4 flex flex-col min-h-0 justify-center w-full max-w-md mx-auto gap-5 sm:gap-6">
        <div className="w-full bg-[#1C1C1C] border-[3px] border-[#1C1C1C] p-3 text-center rounded-brutalist transform -rotate-1 shadow-hard shrink-0">
          <h2 className="font-pixel text-[#FF6B35] text-2xl sm:text-3xl font-bold tracking-widest uppercase">
            SELECIONE O ALVO_
          </h2>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-3 min-h-0">
          {themes.map((themeOption) => {
            const isSelected = votedTheme === themeOption;
            const hasVotedAny = votedTheme !== null;

            return (
              <button
                key={themeOption}
                type="button"
                disabled={hasVotedAny && !isSelected}
                onClick={() => handleVote(themeOption)}
                className={`w-full border-[4px] border-[#1C1C1C] rounded-brutalist p-4 text-left font-pixel text-xl sm:text-2xl uppercase tracking-wider transition-all shadow-hard shrink-0
                  ${isSelected 
                    ? 'bg-[#FF6B35] text-[#1C1C1C] translate-y-1 shadow-none' 
                    : 'bg-[#F7F5F0] text-[#1C1C1C] active:translate-y-1 active:shadow-none disabled:opacity-40'
                  }
                `}
              >
                {isSelected ? `> ${themeOption} [X]` : `  ${themeOption}`}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full shrink-0 bg-[#1C1C1C] border-[3px] border-[#1C1C1C] text-[#F7F5F0] p-4 text-center rounded-brutalist font-pixel text-xl sm:text-2xl uppercase tracking-widest">
        {votedTheme ? (
          <span className="text-[#06D6A0] animate-pulse">AGUARDANDO OUTROS VOTOS...</span>
        ) : (
          <span>SISTEMA PRONTO PARA CAPTURA</span>
        )}
      </div>
    </main>
  );
}