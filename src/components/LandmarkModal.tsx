import React from 'react';
import { Landmark } from '../types/kaaba';
import { X, BookOpen, Sparkles, Navigation, Copy, Check } from 'lucide-react';

interface LandmarkModalProps {
  landmark: Landmark | null;
  onClose: () => void;
  language: 'bn' | 'en';
}

export const LandmarkModal: React.FC<LandmarkModalProps> = ({
  landmark,
  onClose,
  language,
}) => {
  const [copied, setCopied] = React.useState(false);
  if (!landmark) return null;

  const isBn = language === 'bn';

  const handleCopyDua = () => {
    if (landmark.duaBn) {
      navigator.clipboard.writeText(`${landmark.duaAr || ''}\n\n${landmark.duaBn}\n\n${landmark.duaMeaningBn || ''}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn pointer-events-auto">
      <div className="bg-stone-900 border border-amber-900/50 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative text-stone-100 max-h-[85vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="pr-8 space-y-1">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider font-bengali">
            {isBn ? 'পবিত্র স্থানের বিবরণ ও ফজিলত' : 'Sacred Sanctuary Site Guide'}
          </span>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
            <h2 className="text-lg sm:text-2xl font-bold text-white font-bengali">
              {isBn ? landmark.nameBn : landmark.nameEn}
            </h2>
            <span className="font-arabic text-xl sm:text-2xl text-amber-300">
              {landmark.nameAr}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4 pt-4 border-t border-stone-800 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1 font-bengali">
              {isBn ? 'ঐতিহাসিক ও কাঠামোগত বিবরণ:' : 'History & Architecture:'}
            </h4>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-bengali">
              {isBn ? landmark.descriptionBn : landmark.descriptionEn}
            </p>
          </div>

          {/* Virtues / Hadith */}
          <div className="p-3.5 bg-stone-950/80 border border-amber-500/20 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-bengali">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{isBn ? 'কুরআন ও সুন্নাহর আলোকে ফজিলত:' : 'Virtue & Significance:'}</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed italic font-bengali">
              {isBn ? landmark.virtueBn : landmark.virtueEn}
            </p>
          </div>

          {/* Special Recommended Dua */}
          {landmark.duaBn && (
            <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-bengali">
                  <BookOpen className="w-4 h-4" />
                  {isBn ? 'এখানে পঠিত বিশেষ দোয়া:' : 'Recommended Supplication:'}
                </span>
                <button
                  onClick={handleCopyDua}
                  className="text-stone-400 hover:text-emerald-300 text-xs flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
                </button>
              </div>

              {landmark.duaAr && (
                <p className="font-arabic text-lg text-emerald-200 text-right leading-relaxed py-1">
                  {landmark.duaAr}
                </p>
              )}

              <p className="text-xs text-stone-300 font-bengali">
                <span className="text-emerald-400 font-semibold">{isBn ? 'উচ্চারণ: ' : 'Pronunciation: '}</span>
                {landmark.duaBn}
              </p>

              {landmark.duaMeaningBn && (
                <p className="text-xs text-stone-400 font-bengali">
                  <span className="text-emerald-400 font-semibold">{isBn ? 'অর্থ: ' : 'Meaning: '}</span>
                  {landmark.duaMeaningBn}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs sm:text-sm cursor-pointer transition-colors font-bengali"
          >
            {isBn ? 'দর্শন সম্পন্ন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
