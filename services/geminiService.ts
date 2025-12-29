
import { GoogleGenAI, Modality } from "@google/genai";
import { decode, decodeAudioData, audioBufferToWav } from "./audioUtils";

const API_KEY = process.env.API_KEY || "";

export async function generateSpeech(params: {
  text: string;
  voiceName: string;
  accent: string;
  style: string;
  speed: number;
  pitch: number;
}): Promise<{ audioUrl: string; blob: Blob }> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // Construct a prompt that guides the model on how to handle the emotional tags and accent
  const prompt = `Actúa como un locutor con voz de ${params.voiceName}, acento de ${params.accent} y en un estilo ${params.style}.
Instrucciones especiales para el texto:
- Si ves [pausa], haz un silencio de 2 segundos.
- Si ves [risa], ríete naturalmente.
- Si ves [grito], habla de forma enérgica, exclamativa y con volumen alto.
- Si ves [llanto], produce un breve sonido de llanto antes de seguir.
- Mantén la velocidad de habla a un factor de ${params.speed}x (siendo 1.0 lo normal).
- El tono (pitch) debe ser ${params.pitch > 1.2 ? 'más agudo' : params.pitch < 0.8 ? 'más grave' : 'normal'}.

Texto a leer:
${params.text}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: params.voiceName as any },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No se generaron datos de audio.");
    }

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const bytes = decode(base64Audio);
    const audioBuffer = await decodeAudioData(bytes, audioCtx, 24000, 1);
    
    // Convert to WAV for easier handling and download
    const wavBlob = audioBufferToWav(audioBuffer);
    const audioUrl = URL.createObjectURL(wavBlob);

    return { audioUrl, blob: wavBlob };
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
}
