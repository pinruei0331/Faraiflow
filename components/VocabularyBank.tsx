
import React, { useState } from 'react';
import { VocabularyItem, UIContent } from '../types';
import { Search, Volume2, Loader2, BookMarked } from 'lucide-react';
import { playPronunciation } from '../services/gemini';

interface VocabularyBankProps {
  vocabulary: VocabularyItem[];
  ui: UIContent;
}

export const VocabularyBank: React.FC<VocabularyBankProps> = ({ vocabulary, ui }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filteredVocab = vocabulary.filter(item => 
    item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.transliteration.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlay = async (text: string, id: string) => {
    if (playingId) return;
    setPlayingId(id);
    await playPronunciation(text);
    setPlayingId(null);
  };

  return (
    <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
                type="text" 
                placeholder={ui.searchVocab}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            />
        </div>

        {vocabulary.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
                <BookMarked className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">{ui.noWords}</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredVocab.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center group">
                        <div>
                            <h3 className="text-2xl font-farsi font-bold text-red-700 mb-1">{item.word}</h3>
                            <p className="text-sm text-slate-500 font-medium mb-0.5">{item.transliteration}</p>
                            <p className="text-base text-green-700">{item.meaning}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <button 
                                onClick={() => handlePlay(item.word, item.id)}
                                disabled={playingId !== null}
                                className={`p-2.5 rounded-full bg-slate-50 text-green-600 hover:bg-green-50 transition-colors ${playingId === item.id ? 'opacity-50' : ''}`}
                            >
                                {playingId === item.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <span className="text-[10px] text-slate-300 font-medium bg-slate-50 px-2 py-1 rounded-md">
                                Lvl {item.learnedAtLevel}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};
