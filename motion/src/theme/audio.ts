export type AudioCue = {
  frame: number;
  kind: string;
  asset: string;
  note: string;
};

// Arquivos de áudio não foram fornecidos. Esta cue sheet fica pronta para a mixagem licenciada.
export const audioCues: AudioCue[] = [
  {
    frame: 0,
    kind: "music",
    asset: "music-120bpm.mp3",
    note: "Entrada minimalista; crescer em 780, reduzir em 4020.",
  },
  {
    frame: 30,
    kind: "low impact",
    asset: "impact-soft.wav",
    note: "Ponto vira símbolo.",
  },
  {
    frame: 330,
    kind: "whoosh",
    asset: "whoosh-soft.wav",
    note: "Máscara CASA.",
  },
  {
    frame: 750,
    kind: "bass hit",
    asset: "bass-hit.wav",
    note: "Serviços comprimem no telefone.",
  },
  {
    frame: 1224,
    kind: "typing",
    asset: "typing-soft.wav",
    note: "Busca Eletricista.",
  },
  {
    frame: 1530,
    kind: "pin pop",
    asset: "pin-pop.wav",
    note: "Pin revela mapa.",
  },
  {
    frame: 2340,
    kind: "UI click",
    asset: "click-soft.wav",
    note: "Solicitar serviço.",
  },
  { frame: 2700, kind: "UI pop", asset: "pop-soft.wav", note: "Propostas." },
  {
    frame: 3060,
    kind: "notification",
    asset: "notification-soft.wav",
    note: "Mensagem recebida.",
  },
  {
    frame: 3420,
    kind: "confirmation",
    asset: "confirmation-soft.wav",
    note: "Serviço agendado.",
  },
  {
    frame: 4020,
    kind: "soft bass hit",
    asset: "brand-hit.wav",
    note: "Revelação da marca; segurar silêncio visual ao final.",
  },
];
