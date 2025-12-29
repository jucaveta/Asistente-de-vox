
import React, { useState, useEffect, useCallback } from 'react';
import { VOICES, ACCENTS, STYLES, TAGS_GUIDE } from './constants';
import { VoiceOption, Accent, Style, HistoryItem } from './types';
import { generateSpeech } from './services/geminiService';

const App: React.FC = () => {
  const [text, setText] = useState('¡Hola! Soy tu asistente de voz personalizado. [pausa] ¿En qué puedo ayudarte hoy? [risa]');
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VOICES[0]);
  const [selectedAccent, setSelectedAccent] = useState<Accent>(Accent.ESPAÑA);
  const [selectedStyle, setSelectedStyle] = useState<Style>(Style.NATURAL);
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load history from localStorage if available
  useEffect(() => {
    const savedHistory = localStorage.getItem('vozia_history');
    if (savedHistory) {
      try {
        // We can't save blobs/urls directly, so history is session-only for actual audio
        // or we could save metadata and let user re-generate.
        // For this demo, let's keep history in-memory only for the session's audio.
      } catch (e) {
        console.error("Error loading history", e);
      }
    }
  }, []);

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    setError(null);
    try {
      const { audioUrl } = await generateSpeech({
        text,
        voiceName: selectedVoice.apiName,
        accent: selectedAccent,
        style: selectedStyle,
        speed,
        pitch
      });

      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        text: text.length > 50 ? text.substring(0, 50) + '...' : text,
        timestamp: new Date(),
        audioUrl,
        settings: {
          voice: selectedVoice.name,
          accent: selectedAccent,
          style: selectedStyle,
          speed,
          pitch
        }
      };

      setHistory(prev => [newItem, ...prev]);
    } catch (err: any) {
      setError(err.message || "Error al generar el audio. Inténtalo de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  const insertTag = (tag: string) => {
    setText(prev => prev + ' ' + tag);
  };

  const downloadAudio = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-indigo-700 text-white py-8 px-4 shadow-lg mb-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
              Vozia TTS
            </h1>
            <p className="text-indigo-100 mt-1 opacity-90">Transforma tu texto en locuciones realistas con IA</p>
          </div>
          <div className="bg-indigo-600/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-indigo-400/30">
            <span className="text-sm font-medium">Model: Gemini 2.5 TTS Preview</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configuration & Input */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
              Texto a transformar
            </h2>
            <textarea
              className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none mb-3"
              placeholder="Escribe el texto aquí..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex flex-wrap gap-2 mb-4">
              {TAGS_GUIDE.map(t => (
                <button
                  key={t.tag}
                  onClick={() => insertTag(t.tag)}
                  title={t.desc}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100 flex items-center gap-1"
                >
                  <span className="text-indigo-400">+</span> {t.tag}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !text.trim()}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-3 ${
                isGenerating ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
              }`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando audio...
                </>
              ) : (
                <>
                  Generar Locución
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                  </svg>
                </>
              )}
            </button>
            {error && <p className="mt-3 text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
          </section>

          {/* History */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-6 bg-slate-800 rounded-full"></span>
                Historial de Audios
              </div>
              <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded">Sesión actual</span>
            </h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <div className="text-center py-12 text-slate-400 italic">
                  No hay audios generados todavía.
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="text-sm text-slate-700 font-medium mb-1 line-clamp-1">{item.text}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-2 py-0.5 bg-white border border-slate-200 rounded">
                            {item.settings.voice} ({item.settings.accent})
                          </span>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-2 py-0.5 bg-white border border-slate-200 rounded">
                            {item.settings.style}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => downloadAudio(item.audioUrl, `vozia-${item.id.slice(0, 8)}.wav`)}
                        className="text-indigo-600 p-2 hover:bg-indigo-50 rounded-full transition-colors"
                        title="Descargar audio"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                      </button>
                    </div>
                    <audio src={item.audioUrl} controls className="w-full h-8" />
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right: Settings Sidebar */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
              </svg>
              Ajustes de Voz
            </h2>

            {/* Selectores */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Seleccionar Voz</label>
                <div className="grid grid-cols-2 gap-2">
                  {VOICES.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVoice(v)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-all text-left flex items-center gap-2 ${
                        selectedVoice.id === v.id 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600' 
                        : 'border-slate-200 hover:border-indigo-300 text-slate-600'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${v.gender === 'Hombre' ? 'bg-blue-400' : 'bg-pink-400'}`}></span>
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Acento</label>
                <select 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={selectedAccent}
                  onChange={(e) => setSelectedAccent(e.target.value as Accent)}
                >
                  {ACCENTS.map(acc => (
                    <option key={acc} value={acc}>{acc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Estilo Emocional</label>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedStyle(s)}
                      className={`px-3 py-1.5 text-xs rounded-full border font-medium capitalize transition-all ${
                        selectedStyle === s 
                        ? 'bg-slate-800 text-white border-slate-800' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-slate-100" />

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-700">Velocidad de Lectura</label>
                  <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{speed.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2.0" 
                  step="0.1" 
                  value={speed} 
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-700">Tono (Pitch)</label>
                  <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{pitch.toFixed(2)}</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2.0" 
                  step="0.05" 
                  value={pitch} 
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between mt-1 px-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Grave</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Normal</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Agudo</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg text-white">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
              Consejo Pro
            </h3>
            <p className="text-sm opacity-90 leading-relaxed">
              Usa las etiquetas como <code className="bg-white/20 px-1 rounded">[pausa]</code> para dar naturalidad a la voz. La IA de Gemini interpretará el contexto para aplicar la entonación correcta según el acento elegido.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default App;
