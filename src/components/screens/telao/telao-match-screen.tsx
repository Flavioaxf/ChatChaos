interface TelaoMatchScreenProps {
  currentRound: number;
  activeTeam: string;
  theme: string;
  currentText: string;
  timeLeft: number;
  activeCursors: { playerId: string; playerName: string; color: string; }[];
}

export default function TelaoMatchScreen(props: TelaoMatchScreenProps) {
  return <div>Tela de Partida</div>;
}