import React, { useState, useEffect, useCallback } from 'react';
import { CameraMode, TimeOfDay, Landmark, AppSettings } from './types/kaaba';
import { KaabaScene } from './components/KaabaScene';
import { TopNav } from './components/TopNav';
import { QuickLandmarkBar } from './components/QuickLandmarkBar';
import { TawafHUD } from './components/TawafHUD';
import { WalkControlsOverlay } from './components/WalkControlsOverlay';
import { LandmarkModal } from './components/LandmarkModal';
import { DuaGuideModal } from './components/DuaGuideModal';
import { SettingsModal } from './components/SettingsModal';
import { soundManager } from './utils/audio';
import { RotateCw, Footprints, Compass, Sparkles, X } from 'lucide-react';

export default function App() {
  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('dhuhr');
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [currentLap, setCurrentLap] = useState<number>(1);
  const [isDuaGuideOpen, setIsDuaGuideOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState<boolean>(true);
  const [virtualJoystick, setVirtualJoystick] = useState<{ x: number; y: number } | null>(null);

  const [settings, setSettings] = useState<AppSettings>({
    language: 'bn',
    crowdDensity: 1200,
    crowdSpeed: 1.0,
    soundEnabled: true,
    talbiyahPlaying: false,
    soundVolume: 0.6,
    showLandmarkPins: true,
    walkSpeed: 6.5,
  });

  // Sound effects & Ambient audio lifecycle
  useEffect(() => {
    soundManager.setMuted(!settings.soundEnabled);
    soundManager.setVolume(settings.soundVolume);

    if (settings.soundEnabled) {
      soundManager.startAmbient();
    } else {
      soundManager.stopAmbient();
    }

    return () => {
      soundManager.stopAmbient();
      soundManager.stopTalbiyah();
    };
  }, [settings.soundEnabled]);

  useEffect(() => {
    soundManager.setVolume(settings.soundVolume);
  }, [settings.soundVolume]);

  const handleToggleTalbiyah = useCallback(() => {
    setSettings((prev) => {
      const willPlay = !prev.talbiyahPlaying;
      if (willPlay) {
        soundManager.startTalbiyah();
      } else {
        soundManager.stopTalbiyah();
      }
      return { ...prev, talbiyahPlaying: willPlay };
    });
  }, []);

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleTawafLapCompleted = useCallback((lapNumber: number) => {
    setCurrentLap(lapNumber);
    soundManager.playIstilamChime();
  }, []);

  const isBn = settings.language === 'bn';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 font-sans select-none">
      {/* 3D WebGL Kaaba Canvas */}
      <KaabaScene
        cameraMode={cameraMode}
        timeOfDay={timeOfDay}
        crowdDensity={settings.crowdDensity}
        crowdSpeed={settings.crowdSpeed}
        showLandmarkPins={settings.showLandmarkPins}
        selectedLandmark={selectedLandmark}
        onSelectLandmark={setSelectedLandmark}
        onTawafLapCompleted={handleTawafLapCompleted}
        walkSpeed={settings.walkSpeed}
        virtualJoystick={virtualJoystick}
      />

      {/* Top Header Navigation */}
      <TopNav
        cameraMode={cameraMode}
        onChangeCameraMode={(mode) => {
          setCameraMode(mode);
          if (showWelcomeBanner) setShowWelcomeBanner(false);
        }}
        timeOfDay={timeOfDay}
        onChangeTimeOfDay={setTimeOfDay}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenDuaGuide={() => setIsDuaGuideOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onStartTalbiyah={handleToggleTalbiyah}
      />

      {/* Quick Landmark Teleportation Dock */}
      <QuickLandmarkBar
        selectedLandmark={selectedLandmark}
        onSelectLandmark={(landmark) => {
          setSelectedLandmark(landmark);
          // If in walk or drone, switch to orbit for close inspection
          if (cameraMode !== 'orbit') {
            setCameraMode('orbit');
          }
        }}
        language={settings.language}
      />

      {/* Tawaf HUD (Always visible in Tawaf mode, or accessible in other modes) */}
      {cameraMode === 'tawaf' && (
        <TawafHUD
          currentLap={currentLap}
          onSetLap={setCurrentLap}
          language={settings.language}
        />
      )}

      {/* First-Person Walk Mode Overlay (Joystick & Keys) */}
      {cameraMode === 'walk' && (
        <WalkControlsOverlay
          onJoystickMove={setVirtualJoystick}
          language={settings.language}
        />
      )}

      {/* Welcome & Instructions Quick Card (dismissible) */}
      {showWelcomeBanner && (
        <div className="absolute top-20 sm:top-24 left-3 sm:left-6 z-20 pointer-events-auto max-w-sm animate-fadeIn">
          <div className="bg-stone-900/90 backdrop-blur-md border border-amber-500/40 rounded-2xl p-4 shadow-2xl space-y-2.5 text-stone-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 font-bengali">
                <Sparkles className="w-3.5 h-3.5" />
                {isBn ? 'স্বাগতম মক্কার কাবা শরীফ ৩ডিতে' : 'Welcome to Holy Kaaba 3D'}
              </span>
              <button
                onClick={() => setShowWelcomeBanner(false)}
                className="text-stone-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed font-bengali">
              {isBn
                ? 'পবিত্র কাবা শরীফকে ঘিরে হাজীদের জীবন্ত তাওয়াফ চলছে। আপনি মাউস বা টাচ দিয়ে ৩৬০° ঘুরে দেখতে পারেন, "হেঁটে দেখুন" মোডে নিজে কাবা ও হাতিমে ঘুরে বেড়াতে পারেন, অথবা "তাওয়াফে যোগ দিন" বোতাম চেপে হাজীদের সাথে প্রদক্ষিণ করতে পারেন।'
                : 'Experience the live circumambulation of pilgrims around the Holy Kaaba. Orbit 360°, walk as a pilgrim, or join the Tawaf stream.'}
            </p>

            <div className="flex items-center gap-2 pt-1 font-bengali">
              <button
                onClick={() => {
                  setCameraMode('tawaf');
                  setShowWelcomeBanner(false);
                }}
                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{isBn ? 'তাওয়াফে যুক্ত হোন' : 'Join Tawaf'}</span>
              </button>
              <button
                onClick={() => {
                  setCameraMode('walk');
                  setShowWelcomeBanner(false);
                }}
                className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-stone-700"
              >
                <Footprints className="w-3.5 h-3.5" />
                <span>{isBn ? 'নিজে হাঁটুন' : 'Walk Mode'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals & Dialogs */}
      <LandmarkModal
        landmark={selectedLandmark}
        onClose={() => setSelectedLandmark(null)}
        language={settings.language}
      />

      <DuaGuideModal
        isOpen={isDuaGuideOpen}
        onClose={() => setIsDuaGuideOpen(false)}
        language={settings.language}
        onStartTalbiyah={handleToggleTalbiyah}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}
