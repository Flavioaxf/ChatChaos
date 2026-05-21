'use client';
import React from 'react';

interface Player {
  id: string;
  name: string;
  avatar: string;
}

interface TelaoLobbyScreenProps {
  roomCode: string;
  players: Player[];
  onStartGame?: () => void;
}

export default function TelaoLobbyScreen({ roomCode, players = [], onStartGame }: TelaoLobbyScreenProps) {
  const maxSlots = 8;
  const slotsVagos = maxSlots - players.length;

  return (
    <main className="min-h-screen bg-[#F7F5F0] text-[#1C1C1C] flex flex-col justify-between p-8 font-sans select-none">
      
      {/* CABEÇALHO SUPERIOR */}
      <div className="flex justify-between items-center border-b-2 border-[#D0CEC8] pb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-normal text-[#FF6B35] tracking-wider style-vt323">
            SALA_ATALHO: <span className="underline font-mono">{roomCode}</span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-ping" />
          <span className="text-sm bg-[#EDEBE5] border border-[#D0CEC8] px-3 py-1 rounded-[8px] font-mono font-medium text-[#888888] tracking-wider style-vt323">
            AGUARDANDO_CONEXOES ({players.length}/{maxSlots})_
          </span>
        </div>
      </div>

      {/* ÁREA CENTRAL PRINCIPAL */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-6">
        <h1 className="text-5xl font-normal mb-2 tracking-wide style-vt323 uppercase">
          CONECTE SEU DISPOSITIVO_
        </h1>
        <p className="text-[#888888] text-lg mb-12 max-w-md mx-auto">
          Acesse a raiz do sistema no seu dispositivo móvel e insira o código acima para inicializar o seu terminal.
        </p>
        
        {/* GRID DE JOGADORES */}
        <div className="grid grid-cols-4 gap-6 max-w-4xl w-full px-4">
          {players.map((player) => (
            <div 
              key={player.id}
              className="p-6 bg-[#EDEBE5] border-2 border-[#1C1C1C] rounded-[8px] flex flex-col items-center justify-center min-h-[140px]"
            >
              <pre className="text-3xl font-mono text-[#FF6B35] mb-3 select-none">
                {player.avatar || '(O_O)'}
              </pre>
              <span className="font-bold text-base tracking-wide uppercase truncate max-w-full">
                {player.name}
              </span>
              <div className="text-[10px] text-[#888888] font-mono mt-1 style-vt323 tracking-widest">
                STATUS: READY
              </div>
            </div>
          ))}

          {Array.from({ length: slotsVagos > 0 ? slotsVagos : 0 }).map((_, index) => (
            <div 
              key={`vago-${index}`}
              className="p-6 bg-transparent border-2 border-dashed border-[#D0CEC8] rounded-[8px] flex flex-col items-center justify-center min-h-[140px] text-[#888888]"
            >
              <pre className="text-xl font-mono opacity-30 mb-2">{"( ... )"}</pre>
              <span className="text-xs font-medium tracking-widest text-[#888888] opacity-60 style-vt323">
                SLOT_DISPONIVEL_
              </span>
            </div>
          ))}
        </div>

        {players.length >= 2 && onStartGame && (
          <button
            onClick={onStartGame}
            className="mt-12 px-8 py-3 bg-[#1C1C1C] text-[#F7F5F0] font-bold text-sm rounded-[8px] border-b-4 border-[#888888] hover:bg-[#2c2c2c] active:border-b-0 active:mt-[51px] transition-all style-vt323 tracking-widest"
          >
            FORÇAR_INICIO_SISTEMA_
          </button>
        )}
      </div>

      {/* RODAPÉ DO TERMINAL */}
      <div className="flex justify-between items-center text-xs text-[#888888] border-t border-[#D0CEC8] pt-4 style-vt323 tracking-widest">
        <span>CENTRAL_CORE_NETWORK // ENCRYPTED_CONNECTION</span>
        <span>CHAT_CAOS ENGINE v2.0</span>
      </div>
    </main>
  );
}