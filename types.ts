
export enum VoiceGender {
  MALE = 'Hombre',
  FEMALE = 'Mujer'
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: VoiceGender;
  apiName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
}

export interface HistoryItem {
  id: string;
  text: string;
  timestamp: Date;
  audioUrl: string;
  settings: {
    voice: string;
    accent: string;
    style: string;
    speed: number;
    pitch: number;
  };
}

export enum Accent {
  ESPAÑA = 'España',
  MEXICO = 'México',
  ARGENTINA = 'Argentina',
  PERU = 'Perú'
}

export enum Style {
  ALEGRE = 'alegre',
  TRISTE = 'triste',
  SUSURRAR = 'susurrar',
  STORYTELLER = 'storyteller',
  NATURAL = 'natural'
}
