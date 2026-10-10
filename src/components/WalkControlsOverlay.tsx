import React, { useRef, useState, useEffect } from 'react';
import { Footprints, Eye, Zap, Move } from 'lucide-react';

interface WalkControlsOverlayProps {
  onJoystickMove: (dir: { x: number; y: number } | null) => void;
  language: 'bn' | 'en';
}

export const WalkControlsOverlay: React.FC<WalkControlsOverlayProps> = ({
  onJoystickMove,
  language,
}) => {
  const joystickContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isSprintActive, setIsSprintActive] = useState(false);

  const isBn = language === 'bn';

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updateJoystickPos(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    updateJoystickPos(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    onJoystickMove(null);
  };

  const updateJoystickPos = (clientX: number, clientY: number) => {
    if (!joystickContainerRef.current) return;
    const rect = joystickContainerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const maxRadius = rect.width / 2 - 10;
    const dist = Math.hypot(dx, dy);

    let normX = dx;
    let normY = dy;
    if (dist > maxRadius) {
      normX = (dx / dist) * maxRadius;
      normY = (dy / dist) * maxRadius;
    }

    setKnobPos({ x: normX, y: normY });

    // Normalized vector (-1 to 1)
    const factor = isSprintActive ? 1.8 : 1.0;
    onJoystickMove({
      x: (normX / maxRadius) * factor,
      y: (normY / maxRadius) * factor,
    });
  };

  return (
    <>
      {/* Desktop Keyboard Helper (Bottom Left) */}
      <div className="absolute bottom-20 left-4 z-20 pointer-events-auto hidden md:block">
        <div className="bg-stone-900/85 backdrop-blur-md border border-stone-800 rounded-xl p-3 shadow-xl text-stone-300 text-xs space-y-2 max-w-xs font-bengali">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Footprints className="w-4 h-4" />
            <span>{isBn ? 'হেঁটে ঘুরে দেখার নির্দেশিকা' : 'Walk Navigation Controls'}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-stone-800 border border-stone-700 rounded text-amber-300 font-mono">W A S D</kbd>
              <span>{isBn ? 'সামনে/পিছনে/পাশে হাঁটা' : 'Walk directions'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-stone-800 border border-stone-700 rounded text-amber-300 font-mono">মাউস ড্র্যাগ</kbd>
              <span>{isBn ? 'চারপাশে দৃষ্টি ফেরানো' : 'Look around'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-stone-800 border border-stone-700 rounded text-amber-300 font-mono">Shift</kbd>
              <span>{isBn ? 'দ্রুত হাঁটা / দৌড়ানো' : 'Sprint boost'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-stone-800 border border-stone-700 rounded text-amber-300 font-mono">তীর বোতাম</kbd>
              <span>{isBn ? 'কীবোর্ড নেভিগেশন' : 'Arrow keys'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Touch Virtual Joystick (Bottom Left) */}
      <div className="absolute bottom-24 left-4 z-20 pointer-events-auto block md:hidden select-none">
        <div className="flex flex-col items-center gap-2">
          {/* Virtual Joystick Pad */}
          <div
            ref={joystickContainerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-28 h-28 rounded-full bg-stone-900/80 backdrop-blur-md border-2 border-amber-500/30 relative flex items-center justify-center touch-none shadow-2xl active:border-amber-400"
          >
            {/* Center crosshair */}
            <div className="w-4 h-4 rounded-full border border-stone-700 absolute pointer-events-none" />

            {/* Moving Knob */}
            <div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300 flex items-center justify-center shadow-lg transition-transform pointer-events-none"
              style={{
                transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              }}
            >
              <Move className="w-5 h-5 text-stone-950" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-stone-400 font-bengali">
              {isBn ? 'হাঁটার জয়স্টিক' : 'Walk Pad'}
            </span>
            <button
              onClick={() => setIsSprintActive(!isSprintActive)}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer border ${
                isSprintActive
                  ? 'bg-amber-500 text-stone-950 border-amber-400'
                  : 'bg-stone-800 text-stone-400 border-stone-700'
              }`}
            >
              <Zap className="w-2.5 h-2.5 inline mr-0.5" />
              {isSprintActive ? 'স্প্রিন্ট অন' : 'স্প্রিন্ট'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
