
import React, { useState, useEffect } from 'react';
import { LevelConfig, QuizQuestion, UIContent, Language, VocabularyMetadata } from '../types';
import { generateQuiz, playPronunciation } from '../services/gemini';
import { Loader2, CheckCircle2, XCircle, Volume2, ArrowRight, Trophy, Home, BookPlus } from 'lucide-react';

interface QuizInterfaceProps {
  level: LevelConfig;
  stage: number; // 1-10
  ui: UIContent;
  lang: Language;
  onComplete: (xp: number, newWords: VocabularyMetadata[]) => void;
  onExit: () => void;
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({ level, stage, ui, lang, onComplete, onExit }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [collectedWords, setCollectedWords] = useState<VocabularyMetadata[]>([]);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      const generated = await generateQuiz(level.topic, level.difficulty, lang, stage);
      setQuestions(generated);
      setLoading(false);
    };
    loadQuestions();
  }, [level, lang, stage]);

  const handleCheck = () => {
    if (selectedOption === null) return;
    setIsChecked(true);
    const currentQ = questions[currentIndex];
    if (selectedOption === currentQ.correctIndex) {
      setScore(s => s + 1);
      
      if (currentQ.wordMetadata) {
          setCollectedWords(prev => {
              if (prev.some(w => w.word === currentQ.wordMetadata?.word)) return prev;
              return [...prev, currentQ.wordMetadata!];
          });
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setIsChecked(false);
    } else {
      setGameFinished(true);
      onComplete(score * 10, collectedWords);
    }
  };

  const playAudio = (text: string) => {
    playPronunciation(text);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-green-600" />
        <p className="animate-pulse">{ui.loading}</p>
      </div>
    );
  }

  if (gameFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center border-4 border-yellow-200">
            <Trophy className="w-12 h-12 text-yellow-600" />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{ui.completed}</h2>
            <p className="text-green-600 font-bold text-xl mb-4">
                +{score * 10} XP
            </p>
            
            {collectedWords.length > 0 && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-4 max-w-xs mx-auto">
                    <div className="flex items-center justify-center gap-2 text-green-800 font-bold mb-2">
                        <BookPlus className="w-4 h-4" />
                        <span>{ui.wordsLearned}: {collectedWords.length}</span>
                    </div>
                    <div className="text-sm text-slate-600">
                        {collectedWords.map(w => w.word).join(" • ")}
                    </div>
                </div>
            )}

            <p className="text-slate-500 mt-2">
                {score} / {questions.length} Correct
            </p>
        </div>
        <button 
            onClick={onExit}
            className="flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-all hover:shadow-lg transform hover:-translate-y-1"
        >
            <Home className="w-5 h-5" />
            {ui.backHome}
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-3 rounded-full mb-6 overflow-hidden">
        <div 
            className="bg-green-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-4 min-h-[200px] flex flex-col justify-center items-center text-center relative overflow-hidden">
        <div className="absolute top-0 w-full h-1 bg-red-500" />
        <h3 className="text-xl font-bold text-slate-800 mb-4 font-farsi leading-relaxed z-10">
            {currentQ.question}
        </h3>
        
        {(currentQ.pronunciationText || currentQ.wordMetadata?.word) && (
             <button 
             onClick={() => playAudio(currentQ.pronunciationText || currentQ.wordMetadata?.word || "")}
             className="mb-4 p-3 bg-green-50 rounded-full hover:bg-green-100 transition-colors text-green-600 z-10"
           >
             <Volume2 className="w-6 h-6" />
           </button>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3 mb-24">
        {currentQ.options.map((opt, idx) => {
            let statusClass = "border-slate-200 hover:bg-slate-50 hover:border-green-300"; // default
            
            if (isChecked) {
                if (idx === currentQ.correctIndex) {
                    statusClass = "bg-green-100 border-green-600 text-green-900 font-bold";
                } else if (idx === selectedOption && idx !== currentQ.correctIndex) {
                    statusClass = "bg-red-100 border-red-500 text-red-800";
                } else {
                    statusClass = "opacity-50 border-slate-100";
                }
            } else if (selectedOption === idx) {
                statusClass = "bg-green-50 border-green-600 ring-1 ring-green-600";
            }

            return (
                <button
                    key={idx}
                    disabled={isChecked}
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all duration-200 flex justify-between items-center ${statusClass}`}
                >
                    <span>{opt}</span>
                    {isChecked && idx === currentQ.correctIndex && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                    {isChecked && idx === selectedOption && idx !== currentQ.correctIndex && <XCircle className="w-5 h-5 text-red-600" />}
                </button>
            );
        })}
      </div>

      {/* Bottom Action Bar */}
      <div className={`fixed bottom-0 left-0 right-0 p-4 border-t bg-white z-20 transition-colors duration-300 ${isChecked ? (selectedOption === currentQ.correctIndex ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200') : 'border-slate-100'}`}>
        <div className="max-w-4xl mx-auto flex justify-between items-center">
            {isChecked ? (
                <div className="flex-1 pr-4">
                    <div className={`font-bold text-lg mb-1 ${selectedOption === currentQ.correctIndex ? 'text-green-700' : 'text-red-700'}`}>
                        {selectedOption === currentQ.correctIndex ? ui.correct : ui.incorrect}
                    </div>
                    <div className="text-sm text-slate-600">
                        {currentQ.explanation}
                    </div>
                </div>
            ) : (
                <div />
            )}
            
            <button
                onClick={isChecked ? handleNext : handleCheck}
                disabled={!isChecked && selectedOption === null}
                className={`
                    px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 min-w-[140px]
                    ${isChecked 
                        ? (selectedOption === currentQ.correctIndex ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700')
                        : 'bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0'
                    }
                `}
            >
                {isChecked ? (
                    <span className="flex items-center justify-center gap-2">{ui.nextBtn} <ArrowRight className="w-4 h-4" /></span>
                ) : (
                    ui.checkBtn
                )}
            </button>
        </div>
      </div>
    </div>
  );
};
