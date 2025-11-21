
import React from 'react';
import { Modal } from './Modal';
import { UIContent } from '../types';
import { Flame, Calendar } from 'lucide-react';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
  ui: UIContent;
}

export const StreakModal: React.FC<StreakModalProps> = ({ isOpen, onClose, streak, ui }) => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // Adjust for Mon-Sun

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-8 text-center">
        <div className="w-24 h-24 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-6 border-4 border-red-100">
            <Flame className="w-12 h-12 text-red-600 fill-red-600" />
        </div>
        
        <h2 className="text-3xl font-bold text-slate-800 mb-2">{streak} {ui.days}</h2>
        <p className="text-slate-500 mb-8">{ui.streakDesc}</p>
        
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center justify-center gap-2 mb-4 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                This Week
            </div>
            <div className="flex justify-between">
                {days.map((day, idx) => {
                    const isPast = idx <= todayIndex;
                    const isToday = idx === todayIndex;
                    
                    // Simple logic: Simulate active if it's today or up to 2 days prior for demo
                    const isActive = idx === todayIndex || (idx === todayIndex - 1 && streak > 1);

                    return (
                        <div key={idx} className="flex flex-col items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">{day}</span>
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                ${isActive 
                                    ? 'bg-orange-500 text-white shadow-md scale-110' 
                                    : isPast 
                                        ? 'bg-slate-200 text-slate-400' 
                                        : 'bg-white border-2 border-slate-100 text-slate-300'
                                }
                                ${isToday ? 'ring-2 ring-offset-2 ring-orange-200' : ''}
                            `}>
                                {isActive && <Flame className="w-4 h-4 fill-white" />}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
        
        <button onClick={onClose} className="w-full mt-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
            {ui.closeBtn}
        </button>
      </div>
    </Modal>
  );
};
