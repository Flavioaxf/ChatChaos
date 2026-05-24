interface RankingItem {
  id: string;
  name: string;
  avatar: string;
  score: number;
  secretRole: string;
}

interface TelaoResultsScreenProps {
  rankings: RankingItem[];
  onNewGame: () => void;
}

export default function TelaoResultsScreen(props: TelaoResultsScreenProps) {
  return <div>Tela de Resultados</div>;
}