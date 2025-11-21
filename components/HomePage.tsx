
import React, { useState, useEffect } from 'react';
import { UserAccount, UIContent, Language, FactData, LeaderboardEntry } from '../types';
import { generateInterestingFact } from '../services/gemini';
import { generateLeaderboard } from '../services/auth';
import { Sparkles, Trophy, Map, RotateCw, GraduationCap, Lightbulb, Flame, Crown, Medal } from 'lucide-react';

interface HomePageProps {
  user: UserAccount;
  ui: UIContent;
  lang: Language;
  onNavigate: (tab: 'learn' | 'practice' | 'vocab' | 'tutor') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ user, ui, lang, onNavigate }) => {
  const [fact, setFact] = useState<FactData | null>(null);
  const [loadingFact, setLoadingFact] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const fetchFact = async () => {
    setLoadingFact(true);
    const data = await generateInterestingFact(lang);
    if (data) {
      setFact(data);
    }
    setLoadingFact(false);
  };

  useEffect(() => {
    fetchFact();
    setLeaderboard(generateLeaderboard(user));
  }, [lang, user.progress.xp]);

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Banner - Iran Green Background */}
      <div className="bg-green-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden border-b-4 border-red-600">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <GraduationCap className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">{ui.welcomeBack} {user.name}!</h1>
          <p className="text-green-100 opacity-90 mb-6">{ui.subtitle}</p>
          
          <button 
            onClick={() => onNavigate('practice')}
            className="bg-white text-red-700 px-6 py-2.5 rounded-full font-bold shadow hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Map className="w-4 h-4" />
            {ui.continueJourney}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-2 hover:border-red-200 transition-colors">
            <div className="bg-red-50 p-2.5 rounded-full text-red-600">
                <Flame className="w-5 h-5 fill-red-600" />
            </div>
            <div>
                <p className="text-xl font-bold text-slate-800">{user.progress.streak || 1}</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{ui.days}</p>
            </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-2 hover:border-yellow-200 transition-colors">
          <div className="bg-yellow-50 p-2.5 rounded-full text-yellow-500">
            <Sparkles className="w-5 h-5 fill-yellow-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800">{user.progress.xp}</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">XP</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-2 hover:border-green-200 transition-colors">
          <div className="bg-green-50 p-2.5 rounded-full text-green-600">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800">Lvl {user.progress.currentLevel}</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Rank</p>
          </div>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
         <div className="flex items-center gap-2 mb-5">
             <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />
             <h3 className="font-bold text-lg text-slate-800">{ui.leaderboardTitle}</h3>
         </div>
         <div className="space-y-3">
             {leaderboard.map((entry) => (
                 <div 
                    key={entry.name} 
                    className={`flex items-center p-3 rounded-xl transition-colors ${entry.isUser ? 'bg-green-50 border border-green-200' : 'hover:bg-slate-50'}`}
                 >
                     <div className="w-8 font-bold text-slate-400 text-center mr-2">
                         {entry.rank === 1 ? <Medal className="w-6 h-6 text-yellow-500 inline" /> : 
                          entry.rank === 2 ? <Medal className="w-6 h-6 text-slate-400 inline" /> : 
                          entry.rank === 3 ? <Medal className="w-6 h-6 text-orange-400 inline" /> : 
                          `#${entry.rank}`}
                     </div>
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mr-3 ${entry.avatarColor}`}>
                         {entry.name.charAt(0)}
                     </div>
                     <div className="flex-1">
                         <p className={`font-bold text-sm ${entry.isUser ? 'text-green-900' : 'text-slate-700'}`}>
                             {entry.isUser ? `${entry.name} (${ui.you})` : entry.name}
                         </p>
                     </div>
                     <div className="font-bold text-slate-600 text-sm">
                         {entry.xp} XP
                     </div>
                 </div>
             ))}
         </div>
      </div>

      {/* Dynamic Fact Card */}
      <div className="bg-slate-50 border-l-4 border-red-600 rounded-r-xl p-6 shadow-sm relative">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 text-red-700">
             <Lightbulb className="w-5 h-5" />
             <h3 className="font-bold text-lg">{ui.dailyFactTitle}</h3>
          </div>
          <button 
            onClick={fetchFact}
            disabled={loadingFact}
            className="p-2 rounded-full hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
            title={ui.refreshFact}
          >
            <RotateCw className={`w-5 h-5 ${loadingFact ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="min-h-[100px]">
           {loadingFact ? (
             <div className="space-y-3 animate-pulse">
               <div className="h-4 bg-slate-200 rounded w-3/4"></div>
               <div className="h-4 bg-slate-200 rounded w-full"></div>
               <div className="h-4 bg-slate-200 rounded w-5/6"></div>
             </div>
           ) : fact ? (
             <div className="animate-in fade-in duration-500">
                <h4 className="font-bold text-slate-800 mb-2">{fact.title}</h4>
                <p className="text-slate-600 leading-relaxed">{fact.content}</p>
             </div>
           ) : (
             <p className="text-slate-400">Could not load fact.</p>
           )}
        </div>
        <p className="text-xs text-red-300 font-bold uppercase tracking-wider mt-4">{ui.didYouKnow}</p>
      </div>
    </div>
  );
};
