
import React, { useState, useEffect } from 'react';
import { LevelConfig, HandoutData, UIContent, Language } from '../types';
import { generateHandout, playPronunciation } from '../services/gemini';
import { PERSIA_ALPHABET } from '../constants';
import { Loader2, Volume2, BookOpen, Lightbulb, MessageCircle, Globe, Gamepad2, Home, Type, Layers } from 'lucide-react';

interface HandoutViewProps {
  level: LevelConfig;
  stage: number; // 1-10
  ui: UIContent;
  lang: Language;
  onStartQuiz: () => void;
  onExit: () => void;
}

export const HandoutView: React.FC<HandoutViewProps> = ({ level, stage, ui, lang, onStartQuiz, onExit }) => {
  const [data, setData] = useState<HandoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    const loadHandout = async () => {
      setLoading(true);
      const cacheKey = `handout_${level.id}_s${stage}_${lang}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        setData(JSON.parse(cached));
        setLoading(false);
      } else {
        const result = await generateHandout(level.topic, level.difficulty, lang, stage);
        if (result) {
            localStorage.setItem(cacheKey, JSON.stringify(result));
            setData(result);
        }
        setLoading(false);
      }
    };
    loadHandout();
  }, [level, stage, lang]);

  const playAudio = async (text: string) => {
    if (playingAudio) return;
    setPlayingAudio(text);
    await playPronunciation(text);
    setPlayingAudio(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-500">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-green-600" />
        <p className="text-lg animate-pulse">{ui.loading}</p>
        <p className="text-sm text-slate-400 mt-2">Generating lesson for Stage {stage}...</p>
      </div>
    );
  }

  if (!data) {
      return (
          <div className="text-center py-20">
              <p className="text-red-500">Failed to load lesson data.</p>
              <button onClick={onExit} className="mt-4 text-green-600 hover:underline">Go Back</button>
          </div>
      )
  }

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen sm:min-h-0 sm:rounded-2xl sm:shadow-lg border-slate-100 overflow-hidden flex flex-col relative pb-24">
      
      {/* Header - Iran Green */}
      <div className="bg-green-700 p-6 text-white relative overflow-hidden border-b-4 border-white">
        <div className="absolute top-0 right-0 p-4 opacity-10">
             <BookOpen className="w-32 h-32" />
        </div>
        <button onClick={onExit} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
            <Home className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2 text-green-200 text-xs font-bold uppercase tracking-wider mb-2">
            <Layers className="w-4 h-4" />
            {ui.stageIndicator} {stage}/10
        </div>

        <h2 className="text-3xl font-bold relative z-10 mb-2">{data.title}</h2>
        <p className="text-green-100 relative z-10 text-sm opacity-90">{data.introduction}</p>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Alphabet Reference */}
        {level.id === 1 && stage === 1 && (
             <section className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                   <Type className="w-5 h-5 text-green-700" />
                   <h3 className="text-lg font-bold text-slate-800">Alphabet Reference</h3>
               </div>
               <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                   {PERSIA_ALPHABET.map((l, idx) => (
                       <div key={idx} className="bg-white p-1.5 text-center rounded shadow-sm border border-slate-100 flex flex-col items-center justify-center h-14">
                           <span className="font-farsi text-lg leading-none text-red-700">{l.char}</span>
                           <span className="text-[9px] text-slate-400 mt-1 leading-none truncate w-full">{l.transliteration.split('/')[0].trim()}</span>
                       </div>
                   ))}
               </div>
               <p className="text-xs text-slate-400 mt-2 text-center">The Persian alphabet (Alef-Ba) is written from right to left.</p>
           </section>
        )}

        {/* Vocabulary Section */}
        <section>
            <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-green-700" />
                <h3 className="text-xl font-bold text-slate-800">{ui.vocabSection}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.vocabulary.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center hover:border-green-200 transition-colors group">
                        <div className="flex-1 min-w-0 mr-2">
                            <div className="font-farsi text-xl font-bold text-red-700 truncate">{item.word}</div>
                            <div className="text-xs text-slate-500 truncate">{item.transliteration}</div>
                            <div className="text-sm font-medium text-green-700 truncate">{item.meaning}</div>
                        </div>
                        <button 
                            onClick={() => playAudio(item.word)}
                            disabled={playingAudio !== null}
                            className="p-2 text-green-600 bg-white rounded-full shadow-sm hover:bg-green-50 opacity-80 group-hover:opacity-100 transition-all flex-shrink-0"
                        >
                            {playingAudio === item.word ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                    </div>
                ))}
            </div>
        </section>

        {/* Grammar Section */}
        <section className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-slate-800">
                <Lightbulb className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <h3 className="text-xl font-bold">{ui.grammarSection}</h3>
            </div>
            <div className="space-y-4 divide-y divide-slate-200">
                {data.grammar.map((g, idx) => (
                    <div key={idx} className={idx > 0 ? 'pt-3' : ''}>
                        <h4 className="font-bold text-green-800 mb-1 text-base flex items-start gap-2">
                            <span className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider mt-1">Point {idx + 1}</span>
                            {g.title}
                        </h4>
                        <p className="text-slate-700 text-sm leading-relaxed pl-1">{g.content}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* Sentences */}
        <section>
            <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-green-700" />
                <h3 className="text-xl font-bold text-slate-800">{ui.sentencesSection}</h3>
            </div>
            <div className="space-y-3">
                {data.sentences.map((s, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <p className="font-farsi text-lg text-red-700 leading-loose font-bold">{s.persian}</p>
                            <button 
                                onClick={() => playAudio(s.persian)}
                                className="text-slate-400 hover:text-green-600 transition-colors p-1"
                            >
                                <Volume2 className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-slate-400 font-mono">{s.transliteration}</p>
                            <p className="text-sm text-slate-700 font-medium">{s.translation}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* Culture */}
        <section className="bg-red-50 p-5 rounded-xl border border-red-100">
            <div className="flex items-center gap-2 mb-2 text-red-800">
                <Globe className="w-5 h-5" />
                <h3 className="text-xl font-bold">{ui.cultureSection}</h3>
            </div>
            <p className="text-red-900 text-sm leading-relaxed">
                {data.culturalNote}
            </p>
        </section>
      </div>

      {/* Sticky Footer Button - Iran Red CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 flex justify-center">
         <button 
            onClick={onStartQuiz}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all transform hover:-translate-y-1 w-full max-w-md justify-center"
         >
            <Gamepad2 className="w-5 h-5" />
            {ui.startQuizBtn}
         </button>
      </div>
    </div>
  );
};
