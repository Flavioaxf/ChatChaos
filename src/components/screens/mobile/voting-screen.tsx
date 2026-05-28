'use client';
import React, { useState } from 'react';

interface VotingScreenProps {
  playerName?: string;
  avatar?: string;
  wordsToVote?: string[];
  maxVotes?: number;
  onSubmitVotes?: (votes: string[]) => void;
}

export function VotingScreen({
  playerName = 'HACKER_99',
  avatar = '(>_<)',
  // Simulando a frase completa construída pelos jogadores na ordem cronológica
  wordsToVote = [
    'O', 'SISTEMA', 'CAIU', 'PORQUE', 'A', 'GAMBIARRA', 'DO', 'ESTAGIÁRIO', 
    'DEU', 'TELA AZUL', 'NO', 'FIREWALL', 'E', 'AGORA', 'TUDO', 'ESTÁ', 
    'PEGANDO', 'FOGO', 'NO', 'SERVIDOR'
  ],
  maxVotes = 3, // Atualizado para 3 votos como limite ideal
  onSubmitVotes
}: VotingScreenProps) {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Lógica de Toggle: Clicou seleciona, clicou de novo desmarca
  const toggleVote = (word: string) => {
    if (isSubmitted) return;
    
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else if (selectedWords.length < maxVotes) {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleConfirm = () => {
    setIsSubmitted(true);
    if (onSubmitVotes) {
      onSubmitVotes(selectedWords);
    }
  };

  const remainingVotes = maxVotes - selectedWords.length;

  return (
    <main className="h-[100dvh] w-full bg-[#EDEBE5] text-[#1C1C1C] flex flex-col font-sans p-4 sm:p-6 overflow-hidden select-none">
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=VT323&display=swap');
        .font-pixel { font-family: 'VT323', monospace !important; }
        .font-project-sans { font-family: 'DM Sans', sans-serif !important; }
        
        .shadow-hard { box-shadow: 4px 4px 0px #1C1C1C; }
        .rounded-brutalist { border-radius: 6px !important; }

        /* Esconde a barra de rolagem mas mantém a funcionalidade no box interno */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* HEADER: Fixo no topo */}
      <header className="w-full shrink-0 flex justify-between items-center bg-[#1C1C1C] text-[#F7F5F0] px-4 py-2.5 border-[3px] border-[#1C1C1C] shadow-hard rounded-brutalist mb-4 sm:mb-6">
        <span className="font-pixel text-xl sm:text-2xl truncate pr-2 uppercase">{playerName}</span>
        <span className="font-pixel text-2xl sm:text-3xl text-[#FF6B35]">{avatar}</span>
      </header>

      {/* PAINEL DE INSTRUÇÕES: Fixo */}
      <div className="w-full shrink-0 bg-[#1C1C1C] border-[3px] border-[#1C1C1C] p-3 flex flex-col items-center justify-center rounded-brutalist shadow-hard mb-4">
        <h2 className="font-pixel text-[#FF6B35] text-2xl sm:text-3xl font-bold tracking-widest uppercase">
          VOTE NO CAOS_
        </h2>
        <span className="font-pixel text-[#F7F5F0] text-lg sm:text-xl uppercase mt-1 text-center">
          {isSubmitted 
            ? 'VOTOS COMPUTADOS' 
            : `ESCOLHA ATÉ ${maxVotes} TERMOS (${remainingVotes} RESTANTES)`}
        </span>
      </div>

      {/* CAIXA DE TEXTO CRONOLÓGICA (Com scroll interno isolado) */}
      <div className="flex-1 bg-[#F7F5F0] border-[4px] border-[#1C1C1C] rounded-brutalist shadow-hard overflow-hidden flex flex-col mb-4 relative">
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-5">
          <div className="flex flex-wrap gap-2 sm:gap-3 content-start">
            {wordsToVote.map((word, index) => {
              // Combinamos o index para garantir keys únicas caso haja palavras repetidas (ex: dois "NO")
              const uniqueId = `${word}-${index}`; 
              const isSelected = selectedWords.includes(uniqueId);
              const isDisabled = isSubmitted || (!isSelected && selectedWords.length >= maxVotes);

              return (
                <button
                  key={uniqueId}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => toggleVote(uniqueId)}
                  className={`min-h-[44px] border-[3px] border-[#1C1C1C] rounded-[4px] px-3 py-1.5 font-pixel text-xl sm:text-2xl uppercase tracking-wide transition-all select-none
                    ${isSelected 
                      ? 'bg-[#FF6B35] text-[#1C1C1C] translate-y-1' 
                      : 'bg-[#EDEBE5] text-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-[#EDEBE5] active:translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[#CCC] disabled:hover:text-[#1C1C1C]'
                    }
                  `}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>
        {/* Sombra interna para indicar que tem scroll se o texto for muito longo */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#F7F5F0] to-transparent pointer-events-none"></div>
      </div>

      {/* RODAPÉ DO TERMINAL: Fixo na base */}
      <div className="w-full shrink-0">
        {!isSubmitted ? (
          <button
            onClick={handleConfirm}
            disabled={selectedWords.length === 0}
            className="w-full bg-[#1C1C1C] text-[#F7F5F0] border-[4px] border-[#1C1C1C] rounded-brutalist p-4 sm:p-5 font-pixel text-2xl sm:text-3xl uppercase tracking-widest font-bold shadow-hard transition-all active:translate-y-1 active:shadow-none hover:bg-[#FF6B35] hover:text-[#1C1C1C] disabled:opacity-50 disabled:bg-[#CCC] disabled:text-[#888]"
          >
            &gt; CONFIRMAR_VOTOS
          </button>
        ) : (
          <div className="w-full bg-[#1C1C1C] border-[4px] border-[#1C1C1C] text-[#F7F5F0] p-4 sm:p-5 text-center rounded-brutalist font-pixel text-xl sm:text-2xl uppercase tracking-widest flex flex-col items-center gap-2 shadow-hard">
            <span className="text-[#06D6A0] animate-pulse">&gt; DADOS ENVIADOS</span>
            <span className="text-sm sm:text-base text-[#888]">OLHE PARA O TELÃO</span>
          </div>
        )}
      </div>

    </main>
  );
}