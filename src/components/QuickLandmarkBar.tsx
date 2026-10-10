import React from 'react';
import { Landmark } from '../types/kaaba';
import { LANDMARKS } from '../data/landmarks';
import { MapPin, Sparkles, Navigation } from 'lucide-react';

interface QuickLandmarkBarProps {
  selectedLandmark: Landmark | null;
  onSelectLandmark: (landmark: Landmark) => void;
  language: 'bn' | 'en';
}

export const QuickLandmarkBar: React.FC<QuickLandmarkBarProps> = ({
  selectedLandmark,
  onSelectLandmark,
  language,
}) => {
  const isBn = language === 'bn';

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto max-w-full px-3">
      <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-2xl p-2 shadow-2xl flex items-center gap-1.5 overflow-x-auto max-w-[94vw] sm:max-w-fit scrollbar-none">
        <div className="flex items-center gap-1 pl-2 pr-1.5 text-xs text-amber-400 font-semibold shrink-0">
          <Navigation className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-bengali">
            {isBn ? 'পবিত্র স্থানসমূহ:' : 'Holy Sites:'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {LANDMARKS.map((landmark) => {
            const isSelected = selectedLandmark?.id === landmark.id;
            return (
              <button
                key={landmark.id}
                onClick={() => onSelectLandmark(landmark)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20 scale-105'
                    : 'bg-stone-950/60 text-stone-300 hover:text-white hover:bg-stone-800/80 border border-stone-800/80'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-stone-950' : 'bg-amber-400/80'}`} />
                <span className="font-bengali">
                  {isBn ? landmark.nameBn : landmark.nameEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
