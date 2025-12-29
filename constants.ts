
import { VoiceOption, VoiceGender, Accent, Style } from './types';

export const VOICES: VoiceOption[] = [
  { id: 'v1', name: 'Antonio', gender: VoiceGender.MALE, apiName: 'Kore' },
  { id: 'v2', name: 'Beatriz', gender: VoiceGender.FEMALE, apiName: 'Puck' },
  { id: 'v3', name: 'Carlos', gender: VoiceGender.MALE, apiName: 'Fenrir' },
  { id: 'v4', name: 'Diana', gender: VoiceGender.FEMALE, apiName: 'Zephyr' },
  { id: 'v5', name: 'Eduardo', gender: VoiceGender.MALE, apiName: 'Charon' },
  { id: 'v6', name: 'Fernanda', gender: VoiceGender.FEMALE, apiName: 'Puck' },
  { id: 'v7', name: 'Gabriel', gender: VoiceGender.MALE, apiName: 'Kore' },
  { id: 'v8', name: 'Helena', gender: VoiceGender.FEMALE, apiName: 'Zephyr' },
  { id: 'v9', name: 'Ignacio', gender: VoiceGender.MALE, apiName: 'Fenrir' },
  { id: 'v10', name: 'Julia', gender: VoiceGender.FEMALE, apiName: 'Charon' },
];

export const ACCENTS = [
  Accent.ESPAÑA,
  Accent.MEXICO,
  Accent.ARGENTINA,
  Accent.PERU
];

export const STYLES = [
  Style.ALEGRE,
  Style.TRISTE,
  Style.SUSURRAR,
  Style.STORYTELLER,
  Style.NATURAL
];

export const TAGS_GUIDE = [
  { tag: '[pausa]', desc: 'Silencio de 2 segundos' },
  { tag: '[risa]', desc: 'Sonido de risa' },
  { tag: '[grito]', desc: 'Voz alta y enérgica' },
  { tag: '[llanto]', desc: 'Breve llanto' },
];
