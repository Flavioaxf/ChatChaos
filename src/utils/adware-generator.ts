import { AdwareItem } from "@/types/game";

const ADWARE_IMAGES = [
  '/adwares/virus_classico.png',
  '/adwares/premio_falso.gif',
  '/adwares/erro_azul.png',
  '/adwares/aviso_sistema.png'
];

const WINDOW_TITLES = [
  'SISTEMA_INFECTADO.EXE',
  'ERRO_CRITICO_7749',
  'PARABENS_VOCE_GANHOU.EXE',
  'ATENCAO_URGENTE'
];

export const generateAdwarePayload = (): AdwareItem[] => {
  // Limites rigorosos da regra de negócio: entre 2 e 5
  const count = Math.floor(Math.random() * 4) + 2; 
  const payload: AdwareItem[] = [];

  for (let i = 0; i < count; i++) {
    const randomImage = ADWARE_IMAGES[Math.floor(Math.random() * ADWARE_IMAGES.length)];
    const randomTitle = WINDOW_TITLES[Math.floor(Math.random() * WINDOW_TITLES.length)];
    
    payload.push({
      id: `adw_${Date.now()}_${i}`,
      windowTitle: randomTitle,
      imgSrc: randomImage,
      position: { 
        x: Math.floor(Math.random() * 800) + 50, 
        y: Math.floor(Math.random() * 500) + 50 
      },
      size: { 
        width: Math.floor(Math.random() * 200) + 250, 
        height: Math.floor(Math.random() * 150) + 200 
      },
      animationDelay: (i + 1) * 600, // Cascata incremental garantida
      closeable: Math.random() > 0.3
    });
  }

  return payload;
};