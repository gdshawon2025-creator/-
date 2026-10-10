import React from 'react';
import { AppSettings } from '../types/kaaba';
import { X, Users, Gauge, Eye, Volume2, Footprints, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;
  const isBn = settings.language === 'bn';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative text-stone-100 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-amber-200 font-bengali">
              {isBn ? 'ভিড় ও অভিজ্ঞতা নিয়ন্ত্রণ সেটিংস' : 'Simulation & Crowd Settings'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="space-y-4 font-bengali text-xs sm:text-sm">
          {/* Crowd Density Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-stone-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Users className="w-4 h-4 text-emerald-400" />
                {isBn ? 'তাওয়াফকারী হাজীর সংখ্যা (ভিড়):' : 'Pilgrim Crowd Density:'}
              </span>
              <span className="text-amber-400 font-bold">{settings.crowdDensity} জন</span>
            </div>
            <input
              type="range"
              min={300}
              max={2200}
              step={100}
              value={settings.crowdDensity}
              onChange={(e) => onUpdateSettings({ crowdDensity: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500">
              <span>{isBn ? 'কম ভিড় (শান্ত)' : 'Calm'}</span>
              <span>{isBn ? 'মাঝারি' : 'Moderate'}</span>
              <span>{isBn ? 'হজের মহাভিড়' : 'Hajj Rush'}</span>
            </div>
          </div>

          {/* Crowd Speed Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-stone-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Gauge className="w-4 h-4 text-amber-400" />
                {isBn ? 'তাওয়াফের প্রদক্ষিণ গতি:' : 'Tawaf Movement Speed:'}
              </span>
              <span className="text-amber-400 font-bold">{settings.crowdSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={0.4}
              max={2.5}
              step={0.1}
              value={settings.crowdSpeed}
              onChange={(e) => onUpdateSettings({ crowdSpeed: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Walk Speed Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-stone-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Footprints className="w-4 h-4 text-cyan-400" />
                {isBn ? 'নিজের হাঁটার গতিবেগ:' : 'Walk Speed:'}
              </span>
              <span className="text-amber-400 font-bold">{settings.walkSpeed} m/s</span>
            </div>
            <input
              type="range"
              min={3}
              max={14}
              step={1}
              value={settings.walkSpeed}
              onChange={(e) => onUpdateSettings({ walkSpeed: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Toggle Landmark Pins */}
          <div className="flex items-center justify-between py-2 border-t border-stone-800">
            <span className="flex items-center gap-1.5 font-medium text-stone-300">
              <Eye className="w-4 h-4 text-amber-400" />
              {isBn ? 'পবিত্র স্থানসমূহের ৩ডি মার্কার পিন প্রদর্শন' : 'Show 3D Landmark Pins'}
            </span>
            <input
              type="checkbox"
              checked={settings.showLandmarkPins}
              onChange={(e) => onUpdateSettings({ showLandmarkPins: e.target.checked })}
              className="w-4 h-4 accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Sound Volume Slider */}
          <div className="space-y-2 py-2 border-t border-stone-800">
            <div className="flex items-center justify-between text-stone-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                {isBn ? 'আওয়াজের ভলিউম:' : 'Sound Volume:'}
              </span>
              <span className="text-amber-400 font-bold">{Math.round(settings.soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.soundVolume}
              onChange={(e) => onUpdateSettings({ soundVolume: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs sm:text-sm cursor-pointer transition-colors font-bengali"
          >
            {isBn ? 'সংরক্ষণ ও বন্ধ করুন' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
