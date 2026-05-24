const ROLES = ['IRRITADO', 'HACKEADO', 'BEBADO', 'MANDARIM'];

type AssignmentResult = Record<string, { team: 'TIME_A' | 'TIME_B', secretRole: string }>;

export const assignTeamsAndRoles = (playerIds: string[]): AssignmentResult => {
  // Embaralha o array de IDs de forma aleatória
  const shuffled = [...playerIds].sort(() => 0.5 - Math.random());
  
  // Corta na metade (arredondando para cima para o Time A se for ímpar)
  const half = Math.ceil(shuffled.length / 2);
  const timeA = shuffled.slice(0, half);

  const assignments: AssignmentResult = {};

  shuffled.forEach(uid => {
    const team = timeA.includes(uid) ? 'TIME_A' : 'TIME_B';
    const secretRole = ROLES[Math.floor(Math.random() * ROLES.length)];
    assignments[uid] = { team, secretRole };
  });

  return assignments;
};