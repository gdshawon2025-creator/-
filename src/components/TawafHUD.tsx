import React, { useState } from 'react';
import { TAWAF_DUAS } from '../data/duas';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  RotateCw,
  HandMetal,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Award
} from 'lucide-react';

interface TawafHUDProps {
  currentLap: number;
  onSetLap: (lap: number) => void;
  language: 'bn' | 'en';
}

export const TawafHUD: React.FC<TawafHUDProps> = ({
  currentLap,
  onSetLap,
  language,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const [istilamActive, setIstilamActive] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const isBn = language === 'bn';
  const duaIndex = Math.max(0, Math.min(6, currentLap - 1));
  const currentDua = TAWAF_DUAS[duaIndex];

  const handleIstilam = () => {
    soundManager.playIstilamChime();
    setIstilamActive(true);
    setTimeout(() => setIstilamActive(false), 2000);
  };

  const handleNextLap = () => {
    if (currentLap < 7) {
      onSetLap(currentLap + 1);
      soundManager.playIstilamChime();
    } else {
      // Completed all 7 laps!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#10b981', '#ffffff', '#ffd700']
      });
      soundManager.playTawafCompleteSound();
      setShowCelebration(true);
    }
  };

  const handleCopyDua = () => {
    const textToCopy = `${currentDua.arabic}\n\n${currentDua.transliterationBn}\n\n${currentDua.meaningBn}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="absolute top-28 sm:top-24 right-3 sm:right-5 z-20 pointer-events-auto max-w-sm sm:max-w-md w-full">
        <div className="bg-stone-900/90 backdrop-blur-md border border-amber-900/40 rounded-2xl p-4 shadow-2xl text-stone-100 transition-all">
          {/* Header & Lap Indicator */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <RotateCw className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold font-bengali">
                  {isBn ? 'তাওয়াফ চক্কর ট্র্যাকার' : 'Tawaf Circuit Tracker'}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white font-bengali">
                  {isBn ? `চক্কর ${currentLap} / ৭` : `Circuit ${currentLap} of 7`}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleIstilam}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  istilamActive
                    ? 'bg-emerald-500 text-stone-950 scale-105 shadow-lg shadow-emerald-500/30'
                    : 'bg-stone-800 text-amber-300 hover:bg-stone-700 border border-amber-500/30'
                }`}
                title="হাজরে আসওয়াদের দিকে ডান হাত তুলে ইস্তিলাম করুন"
              >
                <span>✋</span>
                <span className="font-bengali">
                  {istilamActive
                    ? (isBn ? 'ইস্তিলাম সম্পন্ন!' : 'Istilam Done!')
                    : (isBn ? 'ইস্তিলাম' : 'Istilam')}
                </span>
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-all cursor-pointer"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Lap Dots Stepper */}
          <div className="flex items-center justify-between gap-1 py-3 px-1">
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <button
                key={num}
                onClick={() => onSetLap(num)}
                className={`flex-1 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  num === currentLap
                    ? 'bg-amber-500 text-stone-950 shadow-md scale-105'
                    : num < currentLap
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                    : 'bg-stone-800/80 text-stone-400 hover:text-white'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Expandable Current Round Dua Card */}
          {isExpanded && (
            <div className="mt-1 pt-3 border-t border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-300/90 font-medium font-bengali">
                  {isBn ? currentDua.titleBn : currentDua.titleEn}
                </span>
                <button
                  onClick={handleCopyDua}
                  className="text-stone-400 hover:text-amber-300 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'দোয়া কপি' : 'Copy')}</span>
                </button>
              </div>

              {/* Arabic text */}
              <div className="p-3 bg-stone-950/70 border border-stone-800 rounded-xl text-right">
                <p className="font-arabic text-lg sm:text-xl text-amber-200 leading-loose">
                  {currentDua.arabic}
                </p>
              </div>

              {/* Bengali Transliteration & Meaning */}
              <div className="space-y-1.5 text-xs text-stone-300 font-bengali leading-relaxed max-h-36 overflow-y-auto pr-1">
                <div>
                  <span className="text-amber-400/90 font-semibold">
                    {isBn ? 'উচ্চারণ: ' : 'Pronunciation: '}
                  </span>
                  <span className="text-stone-200">
                    {isBn ? currentDua.transliterationBn : currentDua.transliterationEn}
                  </span>
                </div>
                <div>
                  <span className="text-emerald-400/90 font-semibold">
                    {isBn ? 'অর্থ: ' : 'Meaning: '}
                  </span>
                  <span className="text-stone-300">
                    {isBn ? currentDua.meaningBn : currentDua.meaningEn}
                  </span>
                </div>
              </div>

              {/* Next Lap Button */}
              <button
                onClick={handleNextLap}
                className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 font-bengali"
              >
                <span>{currentLap < 7 ? (isBn ? 'পরবর্তী চক্করে যান' : 'Advance to Next Round') : (isBn ? 'তাওয়াফ সম্পন্ন করুন 🎉' : 'Complete 7 Circuits 🎉')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 7 Laps Completion Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-stone-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl relative">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 text-2xl shadow-lg">
              ✨
            </div>

            <h3 className="text-xl font-bold text-amber-200 font-bengali">
              {isBn ? 'আলহামদুলিল্লাহ! ৭টি চক্কর সম্পন্ন হয়েছে' : 'Alhamdulillah! 7 Circuits Completed'}
            </h3>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-bengali">
              {isBn
                ? 'আপনার পবিত্র তাওয়াফ সমাপ্ত হয়েছে। সুন্নাত অনুযায়ী এখন মাকামে ইব্রাহিমের পেছনে গিয়ে দুই রাকাত ওয়াজিবুত্তাওয়াফ নামাজ আদায় করুন এবং পরিতৃপ্ত হয়ে জমজমের বরকতময় পানি পান করুন।'
                : 'Your holy Tawaf is complete. As per Sunnah, offer two rakats behind Maqam Ibrahim and drink the blessed Zamzam water.'}
            </p>

            <div className="p-3 bg-stone-950/80 border border-amber-900/40 rounded-xl text-xs text-amber-300 font-bengali">
              "রাব্বানা তাকাব্বাল মিন্না ইন্নাকা আনতাস সামীউল আলীম"
              <br />
              <span className="text-stone-400">হে আমাদের রব! আমাদের পক্ষ থেকে কবুল করে নিন।</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setShowCelebration(false);
                  onSetLap(1);
                }}
                className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors font-bengali"
              >
                {isBn ? 'নতুন তাওয়াফ শুরু করুন' : 'Start New Tawaf'}
              </button>
              <button
                onClick={() => setShowCelebration(false)}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs cursor-pointer transition-colors font-bengali"
              >
                {isBn ? 'ধন্যবাদ' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
