export const assignTeamsAndRoles = (playerIds: string[]): Record<string, { team: 'TIME_A' | 'TIME_B', secretRole: string }> => {
  const shuffledPlayers = [...playerIds].sort(() => Math.random() - 0.5);
  const midPoint = Math.ceil(shuffledPlayers.length / 2);
  const availableRoles = ['IRRITADO', 'HACKEADO', 'BEBADO', 'MANDARIM'];
  
  const assignments: Record<string, { team: 'TIME_A' | 'TIME_B', secretRole: string }> = {};
  
  shuffledPlayers.forEach((uid, index) => {
    const assignedTeam = index < midPoint ? 'TIME_A' : 'TIME_B';
    const assignedRole = availableRoles[Math.floor(Math.random() * availableRoles.length)];
    
    assignments[uid] = {
      team: assignedTeam,
      secretRole: assignedRole
    };
  });
  
  return assignments;
};