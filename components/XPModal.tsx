
import React from 'react';
import { Modal } from './Modal';
import { UIContent } from '../types';
import { Sparkles, Target, Trophy } from 'lucide-react';

interface XPModalProps {
  isOpen: boolean;
  onClose: () => void;
  xp: number;
  ui: UIContent;
}

export const XPModal: React.FC<XPModalProps> = ({ isOpen, onClose, xp, ui }) => {
  const nextMilestone = Math.ceil((xp + 1) / 100) * 100;
  const progress = (xp % 100); 

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-8 text-center">
        <div className="w-24 h-24 mx-auto bg-yellow-50 rounded-full flex items-center justify-center mb-6 border-4 border-yellow-100 animate-in zoom-in duration-300">
            <Sparkles className="w-12 h-12 text-yellow-500 fill-yellow-500" />
        </div>
        
        <h2 className="text-3xl font-bold text-slate-800 mb-2">{xp} XP</h2>
        <p className="text-slate-500 mb-8">{ui.xpDesc}</p>
        
        <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-left">
                <div className="flex justify-between items-end mb-2">
                    <span className="font-bold text-slate-700 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        Next Rank
                    </span>
                    <span className="text-xs text-slate-400">{nextMilestone - xp} XP {ui.nextRank}</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                    <div className="text-xs text-green-600 font-bold uppercase">Quiz XP</div>
                    <div className="text-2xl font-bold text-green-700">{Math.floor(xp * 0.8)}</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <div className="text-xs text-blue-600 font-bold uppercase">Bonus XP</div>
                    <div className="text-2xl font-bold text-blue-700">{Math.ceil(xp * 0.2)}</div>
                </div>
            </div>
        </div>

        <button onClick={onClose} className="w-full mt-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
            {ui.closeBtn}
        </button>
      </div>
    </Modal>
  );
};
