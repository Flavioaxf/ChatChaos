import { AdwareItem } from '@/types/game';

export const generateAdwarePayload = (): AdwareItem[] => {
  const baseAdwareTemplates = [
    { windowTitle: 'SISTEMA_INFECTADO.EXE', imgSrc: '/adwares/virus_classico.png' },
    { windowTitle: 'ERRO_CRITICO_7749', imgSrc: '/adwares/erro_azul.png' },
    { windowTitle: 'PARABENS_VOCE_GANHOU.EXE', imgSrc: '/adwares/premio_falso.gif' },
    { windowTitle: 'ALERTA_DE_INVASAO', imgSrc: '/adwares/hacker_alert.png' },
    { windowTitle: 'DOWNLOAD_CONCLUIDO', imgSrc: '/adwares/download_fake.png' }
  ];
  
  const adwareCount = Math.floor(Math.random() * 4) + 2; // Gera entre 2 e 5 pop-ups
  const payload: AdwareItem[] = [];

  for (let i = 0; i < adwareCount; i++) {
    const templateIndex = Math.floor(Math.random() * baseAdwareTemplates.length);
    const selectedTemplate = baseAdwareTemplates[templateIndex];
    
    payload.push({
      id: `adw_${Date.now()}_${i}_${Math.floor(Math.random() * 1000)}`,
      windowTitle: selectedTemplate.windowTitle,
      imgSrc: selectedTemplate.imgSrc,
      position: { 
        x: Math.floor(Math.random() * 800) + 50, 
        y: Math.floor(Math.random() * 500) + 50 
      },
      size: { 
        width: Math.floor(Math.random() * 100) + 250, // Largura entre 250 e 350
        height: Math.floor(Math.random() * 100) + 200 // Altura entre 200 e 300
      },
      animationDelay: i * 850, // Cascata de exibição
      closeable: Math.random() > 0.25 // 75% de chance de ter botão de fechar
    });
  }
  
  return payload;
};