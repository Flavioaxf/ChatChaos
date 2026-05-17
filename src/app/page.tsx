"use client";

import { useState } from "react";
import { LobbyScreen } from "@/src/components/screens/lobby-screen";
import { ThemeVotingScreen } from "@/src/components/screens/theme-voting-screen";
import { RoleScreen } from "@/src/components/screens/role-screen";
import { GameScreen } from "@/src/components/screens/game-screen";
import { WordVotingScreen } from "@/src/components/screens/word-voting-screen";
import { ResultsScreen } from "@/src/components/screens/results-screen";

export type Screen =
  | "lobby"
  | "theme-voting"
  | "role"
  | "game"
  | "word-voting"
  | "results";

export type Role = "IRRITADO" | "HACKEADO" | "MANDARIM" | "BEBADO" | null;

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("lobby");
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [selectedTheme, setSelectedTheme] = useState("Grupo da empresa");
  
  // Estado para guardar o nome do jogador desde o Lobby
  const [playerName, setPlayerName] = useState<string>("");

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  return (
    <main className="min-h-dvh bg-background flex justify-center overflow-hidden">
      {/* O SEGREDO ESTÁ AQUI: key={currentScreen} força a re-renderização, ativando a animação de glitch */}
      <div key={currentScreen} className="w-full max-w-[390px] min-h-dvh animate-caos-glitch">
        
        {currentScreen === "lobby" && (
          <LobbyScreen 
            onNavigate={navigateTo} 
            onSetPlayerName={setPlayerName} 
          />
        )}
        {currentScreen === "theme-voting" && (
          <ThemeVotingScreen
            onNavigate={navigateTo}
            onSelectTheme={setSelectedTheme}
            playerName={playerName}
          />
        )}
        {currentScreen === "role" && (
          <RoleScreen
            onNavigate={navigateTo}
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
            playerName={playerName}
          />
        )}
        {currentScreen === "game" && (
          <GameScreen
            onNavigate={navigateTo}
            role={selectedRole}
            theme={selectedTheme}
            playerName={playerName}
          />
        )}
        {currentScreen === "word-voting" && (
          <WordVotingScreen onNavigate={navigateTo} />
        )}
        {currentScreen === "results" && (
          <ResultsScreen onNavigate={navigateTo} />
        )}
      </div>
    </main>
  );
}