// src/lib/secretRoles.ts

export function applySecretRole(textDelta: string, role: string | null): string {
  if (!textDelta || !role) return textDelta;
  
  let result = '';
  for (let i = 0; i < textDelta.length; i++) {
    const char = textDelta[i];
    
    if (role === 'IRRITADO') {
      // 100% determinístico (RF-08)
      result += char.toUpperCase();
    } 
    else if (role === 'HACKEADO') {
      // 28% de corrupção binária, exceto espaços (RF-09)
      if (char !== ' ' && Math.random() < 0.28) {
        result += Math.random() < 0.5 ? '0' : '1';
      } else {
        result += char;
      }
    } 
    else if (role === 'BEBADO') {
      // Troca de letras 18% prob. Espaços extras 10% prob (RF-10)
      const map: Record<string, string> = { a:'4', A:'4', e:'3', E:'3', o:'0', O:'0', s:'5', S:'5', t:'7', T:'7' };
      let finalChar = char;
      if (map[char] && Math.random() < 0.18) {
        finalChar = map[char];
      }
      result += finalChar;
      if (Math.random() < 0.10) {
        result += ' '; // Adiciona espaço extra caótico
      }
    } 
    else if (role === 'MANDARIM') {
      // Dicionário local chinês 15% prob (RF-11)
      const dic = ['的','一','是','不','了','人','我','在','有','他','这','为','之','大','来','以','个','中','上','们'];
      if (char !== ' ' && Math.random() < 0.15) {
        result += dic[Math.floor(Math.random() * dic.length)];
      } else {
        result += char;
      }
    } 
    else {
      result += char; // Se não tiver papel ativo, passa intacto
    }
  }
  return result;
}