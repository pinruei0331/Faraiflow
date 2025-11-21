
import React, { useState, useEffect } from 'react';
import { Language, UIContent, LevelConfig, VocabularyMetadata, UserAccount } from './types';
import { PERSIA_ALPHABET, UI_STRINGS } from './constants';
import { LetterCard } from './components/LetterCard';
import { AITutor } from './components/AITutor';
import { LevelMap } from './components/LevelMap';
import { QuizInterface } from './components/QuizInterface';
import { VocabularyBank } from './components/VocabularyBank';
import { HandoutView } from './components/HandoutView';
import { AuthScreen } from './components/AuthScreen';
import { HomePage } from './components/HomePage';
import { LanguageSelector } from './components/LanguageSelector';
import { StreakModal } from './components/StreakModal';
import { XPModal } from './components/XPModal';
import { getCurrentUser, logout, updateUserProgress } from './services/auth';
import { BookOpen, BrainCircuit, Map, Sparkles, Library, LogOut, Home, Flame } from 'lucide-react';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(Language.EN);
  const [activeTab, setActiveTab] = useState<'home' | 'learn' | 'practice' | 'vocab' | 'tutor'>('home');
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Active Game/Study State
  const [activeLevel, setActiveLevel] = useState<LevelConfig | null>(null);
  const [currentStage, setCurrentStage] = useState(1);
  const [isQuizMode, setIsQuizMode] = useState(false);

  // Interactive Modal State
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showXPModal, setShowXPModal] = useState(false);

  useEffect(() => {
    // Check for active session on mount
    const user = getCurrentUser();
    if (user) {
        setCurrentUser(user);
    }
    setIsCheckingAuth(false);
  }, []);

  const ui: UIContent = UI_STRINGS[language];

  const handleLogout = () => {
      logout();
      setCurrentUser(null);
      setActiveLevel(null);
      setActiveTab('home');
  };

  const handleLevelSelect = (level: LevelConfig, stageNumber?: number) => {
      if (!currentUser) return;
      
      // If stage is provided (from menu), use it. Otherwise default to next available.
      const completedStages = currentUser.progress.levelProgress?.[level.id] || 0;
      let startStage = stageNumber || (completedStages + 1);
      if (startStage > 10) startStage = 10; 

      setActiveLevel(level);
      setCurrentStage(startStage);
      setIsQuizMode(false); // Always start with handout
  };

  const handleLevelComplete = (xpGained: number, newWords: VocabularyMetadata[]) => {
     if (!currentUser || !activeLevel) return;

     // Merge new words efficiently
     const currentVocab = currentUser.progress.vocabulary;
     const existingIds = new Set(currentVocab.map(v => v.id));
     const vocabToAdd = newWords
        .filter(w => !existingIds.has(w.word)) // prevent duplicates based on word text
        .map(w => ({
            id: w.word,
            word: w.word,
            transliteration: w.transliteration,
            meaning: w.meaning,
            learnedAtLevel: activeLevel.id,
            learnedAt: Date.now()
        }));

     // Calculate logic for stage progression
     const oldProgress = currentUser.progress.levelProgress?.[activeLevel.id] || 0;
     let newStageProgress = oldProgress;
     let newCurrentLevel = currentUser.progress.currentLevel;
     
     // If we just completed the current stage we were on (and it wasn't a replay of an old stage)
     if (currentStage > oldProgress) {
         newStageProgress = currentStage;
     }

     // If we just finished stage 10, unlock the next level
     if (currentStage === 10 && oldProgress < 10) {
         // Only increment level if we haven't already passed this level ID
         if (activeLevel.id === currentUser.progress.currentLevel) {
             newCurrentLevel = currentUser.progress.currentLevel + 1;
         }
     }

     const newProgress = {
        ...currentUser.progress,
        currentLevel: newCurrentLevel,
        levelProgress: {
            ...currentUser.progress.levelProgress,
            [activeLevel.id]: newStageProgress
        },
        xp: currentUser.progress.xp + xpGained,
        vocabulary: [...currentVocab, ...vocabToAdd],
        lastActivityDate: Date.now()
     };

     // Update local state
     setCurrentUser({ ...currentUser, progress: newProgress });
     
     // Update storage
     updateUserProgress(currentUser.id, newProgress);
  };

  if (isCheckingAuth) return null;

  if (!currentUser) {
      return (
          <>
            <div className="fixed top-4 right-4 z-50">
                <LanguageSelector currentLang={language} onChange={setLanguage} variant="light" />
            </div>
            <AuthScreen ui={ui} onLoginSuccess={setCurrentUser} />
          </>
      );
  }

  const progress = currentUser.progress;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      {/* Header - IRAN GREEN */}
      <header className="bg-green-700 text-white sticky top-0 z-50 shadow-lg border-b-4 border-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-green-700 rounded-lg flex items-center justify-center cursor-pointer shadow-sm hover:bg-green-50 transition-colors" onClick={() => setActiveTab('home')}>
               <span className="font-farsi text-2xl font-bold pt-1">ف</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight hidden sm:block">{ui.title}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {/* Streak Display - Clickable */}
             <button 
                onClick={() => setShowStreakModal(true)}
                className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full border border-white/10 hover:bg-black/30 transition-colors cursor-pointer" 
                title={ui.streak}
             >
                <Flame className="w-4 h-4 text-red-400 fill-red-400" />
                <span className="font-bold text-sm">{progress.streak || 1}</span>
             </button>

             {/* XP Display - Clickable */}
             <button 
                onClick={() => setShowXPModal(true)}
                className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full border border-white/10 hover:bg-black/30 transition-colors cursor-pointer" 
                title={ui.totalXp}
             >
                <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                <span className="font-bold text-sm">{progress.xp}</span>
             </button>

             {/* Profile / Logout */}
             <div className="flex items-center gap-2 pl-2 border-l border-green-600">
                <span className="text-xs font-medium hidden sm:inline opacity-90">{currentUser.name}</span>
                <button
                    onClick={handleLogout}
                    className="p-1.5 hover:bg-green-800 rounded-full transition-colors"
                    title={ui.logout}
                >
                    <LogOut className="w-4 h-4" />
                </button>
             </div>

            <LanguageSelector currentLang={language} onChange={setLanguage} variant="dark" />
          </div>
        </div>
        {/* Decorative Red Line at bottom of header to complete flag tricolor hint */}
        <div className="h-1 w-full bg-red-600" />
      </header>

      {/* Modals */}
      <StreakModal 
        isOpen={showStreakModal} 
        onClose={() => setShowStreakModal(false)} 
        streak={progress.streak || 1} 
        ui={ui} 
      />
      
      <XPModal 
        isOpen={showXPModal} 
        onClose={() => setShowXPModal(false)} 
        xp={progress.xp} 
        ui={ui} 
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        
        {/* Tab Navigation */}
        {!activeLevel && (
            <div className="flex justify-center mb-8">
                <div className="bg-white p-1.5 rounded-full shadow-sm border border-slate-200 flex gap-1 overflow-x-auto scrollbar-hide">
                    <button 
                        onClick={() => setActiveTab('home')}
                        className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                            activeTab === 'home' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <Home className="w-4 h-4" />
                        <span className="hidden sm:inline">{ui.homeTab}</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('learn')}
                        className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                            activeTab === 'learn' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span className="hidden sm:inline">{ui.learnTab}</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('practice')}
                        className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                            activeTab === 'practice' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <Map className="w-4 h-4" />
                        <span className="hidden sm:inline">{ui.practiceTab}</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('vocab')}
                        className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                            activeTab === 'vocab' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <Library className="w-4 h-4" />
                        <span className="hidden sm:inline">{ui.vocabTab}</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('tutor')}
                        className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                            activeTab === 'tutor' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <BrainCircuit className="w-4 h-4" />
                        <span className="hidden sm:inline">{ui.tutorTab}</span>
                    </button>
                </div>
            </div>
        )}

        {activeLevel ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {isQuizMode ? (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-800 border-l-4 border-red-600 pl-3">
                                {language === Language.ZH_TW ? activeLevel.titleZh : 
                                 language === Language.JA ? activeLevel.titleJa :
                                 language === Language.KO ? activeLevel.titleKo :
                                 activeLevel.titleEn}
                            </h2>
                            <button 
                                onClick={() => setActiveLevel(null)} 
                                className="text-slate-400 hover:text-red-600 text-sm font-medium transition-colors"
                            >
                                Exit
                            </button>
                        </div>
                        <QuizInterface 
                            level={activeLevel}
                            stage={currentStage}
                            ui={ui}
                            lang={language}
                            onComplete={handleLevelComplete}
                            onExit={() => setActiveLevel(null)}
                        />
                    </>
                ) : (
                    <HandoutView 
                        level={activeLevel}
                        stage={currentStage}
                        ui={ui}
                        lang={language}
                        onStartQuiz={() => setIsQuizMode(true)}
                        onExit={() => setActiveLevel(null)}
                    />
                )}
            </div>
        ) : (
            // Tab Content
            <>
                {activeTab === 'home' && (
                    <HomePage 
                        user={currentUser} 
                        ui={ui} 
                        lang={language} 
                        onNavigate={(tab) => setActiveTab(tab)}
                    />
                )}

                {activeTab === 'learn' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PERSIA_ALPHABET.map((letter) => (
                    <LetterCard key={letter.char} letter={letter} ui={ui} lang={language} />
                    ))}
                </div>
                )}

                {activeTab === 'practice' && (
                    <LevelMap 
                        progress={progress}
                        onSelectLevel={handleLevelSelect}
                        ui={ui}
                        lang={language}
                    />
                )}

                {activeTab === 'vocab' && (
                    <VocabularyBank vocabulary={progress.vocabulary} ui={ui} />
                )}

                {activeTab === 'tutor' && (
                <div className="max-w-2xl mx-auto">
                    <AITutor ui={ui} lang={language} />
                </div>
                )}
            </>
        )}
      </main>

      {/* Footer */}
      {!activeLevel && (
        <footer className="text-center text-slate-400 text-sm py-8">
            <p>Powered by Google Gemini 2.5 Flash</p>
        </footer>
      )}
    </div>
  );
};

export default App;
