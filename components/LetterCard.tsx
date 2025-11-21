
import React, { useState } from 'react';
import { LetterData, UIContent, Language } from '../types';
import { Volume2, Loader2 } from 'lucide-react';
import { playPronunciation } from '../services/gemini';

interface LetterCardProps {
  letter: LetterData;
  ui: UIContent;
  lang: Language;
}

export const LetterCard: React.FC<LetterCardProps> = ({ letter, ui, lang }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePlay = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const prompt = `Say the Persian letter ${letter.name}, then the sound it makes, then say the word ${letter.exampleWord}`;
    await playPronunciation(prompt);
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-slate-100">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            {/* Red Letter for emphasis (Iran Red) */}
            <h3 className="text-3xl font-bold text-red-600 font-farsi mb-1">{letter.char}</h3>
            <p className="text-lg font-medium text-slate-600">{letter.name}</p>
            <p className="text-sm text-slate-400">{letter.transliteration}</p>
          </div>
          <button
            onClick={handlePlay}
            disabled={isLoading}
            className={`p-3 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={ui.pronounceBtn}
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{ui.connectTitle}</h4>
            <div className="grid grid-cols-4 gap-2 text-center font-farsi text-xl">
              <div className="flex flex-col items-center">
                <span className="text-slate-800">{letter.isolated}</span>
                <span className="text-[10px] text-slate-400 mt-1">Isolated</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-slate-800">{letter.initial}</span>
                <span className="text-[10px] text-slate-400 mt-1">Initial</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-slate-800">{letter.medial}</span>
                <span className="text-[10px] text-slate-400 mt-1">Medial</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-slate-800">{letter.final}</span>
                <span className="text-[10px] text-slate-400 mt-1">Final</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{ui.example}</h4>
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-lg font-farsi text-slate-800 mr-2">{letter.exampleWord}</span>
                    <span className="text-sm text-slate-500 italic">({letter.exampleTransliteration})</span>
                </div>
                <span className="text-sm font-medium text-green-700">
                    {lang === Language.ZH_TW ? letter.exampleMeaningZh : letter.exampleMeaningEn}
                </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
