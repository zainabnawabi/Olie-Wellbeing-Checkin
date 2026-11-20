import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { OlieCharacter } from './OlieCharacter';
import { soundEngine } from '../utils/soundEngine';

interface BreathingModalProps {
  open: boolean;
  onClose: () => void;
}

export function BreathingModal({ open, onClose }: BreathingModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(16);

  useEffect(() => {
    if (!open) {
      setSecondsLeft(16);
      return;
    }
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [open]);

  if (!open) return null;

  const elapsed = 16 - secondsLeft;
  const phase: 'inhale' | 'exhale' = Math.floor(elapsed / 4) % 2 === 0 ? 'inhale' : 'exhale';

  const handleClose = () => {
    soundEngine.playClick(460);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#180747]/70 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="breathe-title"
    >
      <div className="w-full max-w-md rounded-[32px] bg-[#2B0B78] text-white p-8 shadow-2xl relative text-center space-y-5">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
          aria-label="Close breathing pause"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="font-display text-5xl font-bold tabular-nums tracking-tight pt-1">
          {secondsLeft}
        </div>

        <div className="inline-block bg-white text-[#1E2028] text-sm font-semibold px-5 py-2 rounded-full shadow-sm">
          {secondsLeft === 0
            ? 'Nice job taking a quiet moment.'
            : phase === 'inhale'
              ? 'Breathe in slowly...'
              : 'Breathe out gently...'}
        </div>

        <OlieCharacter mood="breathe" phase={phase} />

        <p id="breathe-title" className="text-[15px] text-white/90 leading-relaxed">
          Olie is waiting right here. Stay as long as you like.
        </p>

        <button
          type="button"
          onClick={handleClose}
          className="w-full h-12 rounded-full bg-[#B8F23B] hover:bg-[#A8E32D] text-[#1E2028] text-[15px] font-bold transition-colors cursor-pointer"
        >
          {secondsLeft === 0 ? 'Back to Check In' : 'I feel ready to continue'}
        </button>
      </div>
    </div>
  );
}
