
import React, { useState } from 'react';
import { LevelConfig, UIContent, Language, UserProgress } from '../types';
import { GAME_LEVELS } from '../constants';
import { Modal } from './Modal';
import { Lock, Check, Star, Type, Hash, Users, Palette, Hand, Utensils, Clock, Zap, MapPin, Heart, MessageCircle, GitMerge, Crown, History, BrainCircuit, BookOpen, Sparkles, Feather, Briefcase, Play, RotateCcw } from 'lucide-react';

interface LevelMapProps {
  progress: UserProgress;
  onSelectLevel: (level: LevelConfig, stage: number) => void;
  ui: UIContent;
  lang: Language;
}

// Helper to map icon string name to component
const IconMap: Record<string, React.ElementType> = {
  Type, Hash, Users, Palette, Hand, Utensils, Clock, Zap, MapPin, Heart,
  MessageCircle, GitMerge, Crown, History, BrainCircuit, BookOpen, Sparkles, Feather, Briefcase
};

export const LevelMap: React.FC<LevelMapProps> = ({ progress, onSelectLevel, ui, lang }) => {
  const [selectedLevelForMenu, setSelectedLevelForMenu] = useState<LevelConfig | null>(null);
  
  let lastStageLabel = "";
  const MAX_STAGES = 10;

  const handleLevelClick = (level: LevelConfig) => {
      setSelectedLevelForMenu(level);
  };

  const handleStageSelect = (stage: number) => {
      if (selectedLevelForMenu) {
          onSelectLevel(selectedLevelForMenu, stage);
          setSelectedLevelForMenu(null);
      }
  };

  return (
    <div className="flex flex-col items-center py-10 space-y-6 relative">
      
      {/* Decorative Path Line */}
      <div className="absolute top-10 bottom-10 w-2 bg-slate-200 rounded-full -z-10" />

      {GAME_LEVELS.map((level, index) => {
        const isUnlocked = level.id <= progress.currentLevel;
        const isCompleted = level.id < progress.currentLevel;
        const isCurrent = level.id === progress.currentLevel;
        const levelProgress = progress.levelProgress?.[level.id] || 0;
        const percentage = (levelProgress / MAX_STAGES) * 100;
        const Icon = IconMap[level.icon] || Star;
        
        let currentStageLabel = level.stageLabelEn;
        if (lang === Language.ZH_TW) currentStageLabel = level.stageLabelZh;
        else if (lang === Language.JA) currentStageLabel = level.stageLabelJa;
        else if (lang === Language.KO) currentStageLabel = level.stageLabelKo;
        
        let currentTitle = level.titleEn;
        if (lang === Language.ZH_TW) currentTitle = level.titleZh;
        else if (lang === Language.JA) currentTitle = level.titleJa;
        else if (lang === Language.KO) currentTitle = level.titleKo;

        const showStageHeader = currentStageLabel !== lastStageLabel;
        if (showStageHeader) lastStageLabel = currentStageLabel;

        const radius = 46; 
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        return (
          <React.Fragment key={level.id}>
            {showStageHeader && (
                <div className="z-10 bg-white/95 backdrop-blur px-6 py-2 rounded-full shadow-sm border border-red-200 text-red-700 font-bold text-sm mt-6 mb-2 animate-in fade-in slide-in-from-bottom-2">
                    {currentStageLabel}
                </div>
            )}

            <div className="relative flex flex-col items-center group transition-transform hover:scale-105">
                <button
                onClick={() => isUnlocked && handleLevelClick(level)}
                disabled={!isUnlocked}
                className={`
                    w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-lg transition-all duration-200 z-10 relative
                    ${isCurrent 
                    ? 'bg-green-600 border-transparent text-white' 
                    : isCompleted 
                        ? 'bg-green-100 border-green-500 text-green-600' 
                        : 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                    }
                `}
                >
                {/* Progress Ring (Current active level) */}
                {isCurrent && (
                     <svg className="absolute -top-1 -left-1 w-[104px] h-[104px] rotate-[-90deg]" viewBox="0 0 100 100">
                        <circle 
                            cx="50" cy="50" r={radius} 
                            fill="transparent" 
                            stroke="#e2e8f0" 
                            strokeWidth="6" 
                        />
                        <circle 
                            cx="50" cy="50" r={radius} 
                            fill="transparent" 
                            stroke="#16a34a" // green-600
                            strokeWidth="6"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                     </svg>
                )}

                {isCompleted ? (
                    <Check className="w-10 h-10 stroke-[3]" />
                ) : !isUnlocked ? (
                    <Lock className="w-8 h-8" />
                ) : (
                    <Icon className="w-10 h-10 z-20" />
                )}
                </button>
                
                {/* Tooltip / Label */}
                <div className="mt-3 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-sm text-center max-w-[180px] z-20 relative">
                <h3 className={`font-bold text-sm ${isUnlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                    {currentTitle}
                </h3>
                {isCurrent && (
                    <div className="text-[10px] text-red-600 font-bold uppercase tracking-wider">
                    {levelProgress}/{MAX_STAGES}
                    </div>
                )}
                </div>
            </div>
          </React.Fragment>
        );
      })}

      <div className="h-10" />

      {/* Stage Selection Modal */}
      <Modal isOpen={!!selectedLevelForMenu} onClose={() => setSelectedLevelForMenu(null)}>
         <div className="p-6">
            <h3 className="text-xl font-bold text-center mb-6 border-b pb-4">
                {ui.selectStage}
            </h3>
            
            <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto pr-2">
                {selectedLevelForMenu && Array.from({length: MAX_STAGES}).map((_, idx) => {
                    const stageNum = idx + 1;
                    // Calculate status for THIS specific level
                    const levelProgress = progress.levelProgress?.[selectedLevelForMenu.id] || 0;
                    const isStageUnlocked = stageNum <= levelProgress + 1;
                    const isStageCompleted = stageNum <= levelProgress;
                    const isNext = stageNum === levelProgress + 1;

                    return (
                        <button
                            key={stageNum}
                            disabled={!isStageUnlocked}
                            onClick={() => handleStageSelect(stageNum)}
                            className={`
                                flex items-center justify-between p-4 rounded-xl border-2 transition-all
                                ${isNext 
                                    ? 'bg-green-600 border-green-600 text-white shadow-md transform scale-[1.02]' 
                                    : isStageCompleted 
                                        ? 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100'
                                        : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                                    ${isNext ? 'bg-white text-green-600' : isStageCompleted ? 'bg-green-200 text-green-800' : 'bg-slate-200 text-slate-500'}
                                `}>
                                    {stageNum}
                                </div>
                                <span className="font-bold">{ui.stage} {stageNum}</span>
                            </div>
                            
                            <div>
                                {isNext && <Play className="w-5 h-5 fill-white" />}
                                {isStageCompleted && <RotateCcw className="w-5 h-5" />}
                                {!isStageUnlocked && <Lock className="w-5 h-5" />}
                            </div>
                        </button>
                    );
                })}
            </div>
         </div>
      </Modal>
    </div>
  );
};
