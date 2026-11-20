import { OlieCharacter } from './OlieCharacter';

export function SunnyPeekMascot() {
  return <OlieCharacter mood="welcome" />;
}

interface SunnyCheerProps {
  onTap?: () => void;
  excited?: boolean;
}

export function SunnyCheerMascot({ onTap, excited = false }: SunnyCheerProps) {
  return <OlieCharacter mood="admin" onTap={onTap} excited={excited} />;
}

export function SunnyCelebrateMascot() {
  return <OlieCharacter mood="celebrate" />;
}

export function BreatheBuddyMascot({ phase }: { phase: 'inhale' | 'exhale' }) {
  return <OlieCharacter mood="breathe" phase={phase} />;
}

export function MiniCompanionFace({ variant }: { variant: 'yellow' | 'pink' | 'blue' }) {
  const fill = variant === 'yellow' ? '#FFFFFF' : variant === 'pink' ? '#FFFFFF' : '#FFFFFF';
  return (
    <svg viewBox="0 0 60 60" className="w-12 h-12 shrink-0" aria-hidden="true">
      <circle cx="30" cy="30" r="27" fill={fill} opacity="0.85" />
      <circle cx="21" cy="26" r="3" fill="#1E2028" />
      <circle cx="39" cy="26" r="3" fill="#1E2028" />
      <path
        d="M22 35 Q30 43 38 35"
        fill="none"
        stroke="#1E2028"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
