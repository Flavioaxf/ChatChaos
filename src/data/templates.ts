export const TEMPLATES = {
  TECNOLOGIA: [
    "O servidor principal caiu porque o estagiário decidiu ",
    "A nova atualização do sistema exige que você ",
    "Para contornar o firewall de segurança militar, eu precisei ",
    "O código fonte vazou e agora a IA está tentando ",
    "Seu computador está infectado. Para recuperar os dados, você deve "
  ],
  TRABALHO: [
    "Caro chefe, não poderei ir trabalhar hoje pois ",
    "A meta do trimestre só será atingida se a equipe ",
    "O cliente cancelou o contrato no momento em que percebeu que ",
    "Na reunião de hoje, ficou decidido que a nova política da empresa é ",
    "O RH solicitou minha presença urgente porque descobriram que eu "
  ],
  RELACIONAMENTO: [
    "Amor, precisamos conversar. O problema não é você, é que ",
    "A pior parte do nosso primeiro encontro foi quando você ",
    "Descobri o seu segredo. Eu sei muito bem que você ",
    "Para salvar nosso casamento, o terapeuta sugeriu que nós ",
    "A mensagem que mandei por engano dizia claramente que eu "
  ],
  FANTASIA: [
    "O dragão ancestral acordou de seu sono milenar exigindo ",
    "A poção mágica deu errado e agora o mago está ",
    "O rei prometeu metade do reino para quem conseguir ",
    "A espada lendária só pode ser empunhada por aquele que ",
    "O feitiço proibido foi conjurado, transformando o castelo em "
  ]
};

export const getThemes = () => Object.keys(TEMPLATES);

export const getRandomTemplate = (theme: string, usedTemplates: string[] = []): string => {
  const options = TEMPLATES[theme as keyof typeof TEMPLATES] || TEMPLATES.TECNOLOGIA;
  const available = options.filter(t => !usedTemplates.includes(t));
  if (available.length === 0) return options[Math.floor(Math.random() * options.length)];
  return available[Math.floor(Math.random() * available.length)];
};