import { useEffect, useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { OlieCharacter, OlieMood } from './OlieCharacter';
import { soundEngine } from '../utils/soundEngine';

export interface KindnessActivity {
  id: 'water' | 'shoulders' | 'window' | 'hello';
  title: string;
  mood: OlieMood;
  durationSeconds: number;
  companionIntro: string;
  cues: string[];
  quickNote?: string;
}

export const KINDNESS_ACTIVITIES: KindnessActivity[] = [
  {
    id: 'water',
    title: 'Sip a glass of cool water',
    mood: 'activity-water',
    durationSeconds: 12,
    companionIntro: 'Olie grabbed a cool glass of water too. Take a slow sip together.',
    cues: [
      'Take one slow, cool sip with me.',
      'Pause and feel the cool water settle.',
      'Take one more gentle sip at your own pace.',
    ],
  },
  {
    id: 'shoulders',
    title: 'Drop your shoulders and relax your jaw',
    mood: 'activity-shoulders',
    durationSeconds: 12,
    companionIntro: 'Follow along with Olie. Let every bit of tension melt downward.',
    cues: [
      'Notice where your shoulders are sitting right now.',
      'Let both shoulders drop soft and heavy with me.',
      'Unclench your jaw and rest your face softly.',
    ],
  },
  {
    id: 'window',
    title: 'Look out a window for 20 seconds',
    mood: 'activity-window',
    durationSeconds: 20,
    companionIntro: 'Olie is looking out the window beside you. Let your eyes rest far away.',
    cues: [
      'Gaze softly toward the sky, trees, or horizon.',
      'Let your focus soften on the light outside.',
      'Take one quiet breath while we finish watching.',
    ],
  },
  {
    id: 'hello',
    title: 'Send a quick hello to someone you trust',
    mood: 'activity-hello',
    durationSeconds: 0,
    companionIntro: 'Think of one kind person. Even a tiny message counts.',
    cues: ['Olie is cheering you on. You can copy a simple starter below if you like.'],
    quickNote: 'Hey, thinking of you today and sending a quick hello.',
  },
];

interface KindnessActivityModalProps {
  activity: KindnessActivity | null;
  participantName: string;
  onClose: () => void;
  onComplete: (id: KindnessActivity['id']) => void;
}

export function KindnessActivityModal({
  activity,
  participantName,
  onClose,
  onComplete,
}: KindnessActivityModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [copiedNote, setCopiedNote] = useState(false);

  useEffect(() => {
    if (!activity) return;
    setSecondsLeft(activity.durationSeconds);
    setCopiedNote(false);

    if (activity.durationSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activity]);

  if (!activity) return null;

  const cleanName = participantName.trim();
  const hasTimer = activity.durationSeconds > 0;
  const elapsed = activity.durationSeconds - secondsLeft;
  const cueIndex = hasTimer
    ? Math.min(
        activity.cues.length - 1,
        Math.floor((elapsed / Math.max(1, activity.durationSeconds)) * activity.cues.length)
      )
    : 0;
  const currentCue =
    hasTimer && secondsLeft === 0
      ? `Nice pause${cleanName ? `, ${cleanName}` : ''}. That felt calm.`
      : activity.cues[cueIndex];

  const progressPct = hasTimer
    ? Math.round(((activity.durationSeconds - secondsLeft) / activity.durationSeconds) * 100)
    : 100;

  const handleCopyStarter = async () => {
    if (!activity.quickNote) return;
    soundEngine.playClick(300);
    try {
      await navigator.clipboard.writeText(activity.quickNote);
    } catch {
      const area = document.createElement('textarea');
      area.value = activity.quickNote;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    }
    setCopiedNote(true);
    window.setTimeout(() => setCopiedNote(false), 1800);
  };

  const handleMarkDone = () => {
    soundEngine.playCelebrate();
    onComplete(activity.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#180747]/65 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="activity-modal-title"
    >
      <div className="w-full max-w-md rounded-[32px] bg-white border border-[#CFD5E6] shadow-2xl overflow-hidden text-center">
        {/* Rich Wellbeing Indigo Olie Companion Stage */}
        <div className="bg-gradient-to-b from-[#231073] to-[#4629BF] px-6 pt-7 pb-6 relative overflow-visible text-white">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick(280);
              onClose();
            }}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer z-10"
            aria-label="Close activity"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-xs font-bold tracking-wide text-[#B8F23B]">
            Together with Olie
          </div>

          <div className="mt-3 flex justify-center overflow-visible">
            <OlieCharacter mood={activity.mood} />
          </div>

          {hasTimer && (
            <div className="mt-2 space-y-2 max-w-xs mx-auto">
              <div className="font-display text-3xl font-bold text-white tabular-nums">
                {secondsLeft === 0 ? 'Ready' : `${secondsLeft}s`}
              </div>
              <svg
                viewBox="0 0 100 3.5"
                className="w-full h-2.5 rounded-full overflow-hidden"
                aria-label={`Activity progress ${progressPct}%`}
              >
                <rect x="0" y="0" width="100" height="3.5" rx="1.75" fill="rgba(255,255,255,0.22)" />
                <rect x="0" y="0" width={progressPct} height="3.5" rx="1.75" fill="#B8F23B" />
              </svg>
            </div>
          )}
        </div>

        {/* Guided Cue & Action */}
        <div className="p-7 space-y-5">
          <div>
            <h3 id="activity-modal-title" className="font-display text-xl font-bold text-[#11131D]">
              {activity.title}
            </h3>
            <p className="text-sm font-medium text-[#2B3040] mt-1.5 leading-relaxed">
              {activity.companionIntro}
            </p>
          </div>

          <div className="rounded-2xl bg-[#F2F4FB] border border-[#CFD5E6] px-4 py-3.5 text-[15px] font-bold text-[#11131D]">
            {currentCue}
          </div>

          {activity.quickNote && (
            <div className="rounded-2xl bg-[#EAE6FF] border border-[#C6BCF8] p-4 text-left space-y-2.5">
              <p className="text-sm font-medium text-[#11131D] leading-relaxed">
                &ldquo;{activity.quickNote}&rdquo;
              </p>
              <button
                type="button"
                onClick={handleCopyStarter}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4D2EEB] hover:underline cursor-pointer"
              >
                {copiedNote ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedNote ? 'Copied message' : 'Copy message'}</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleMarkDone}
            className="w-full h-12 rounded-full bg-[#B8F23B] hover:bg-[#A9E42A] text-[#11131D] text-[15px] font-bold transition-colors cursor-pointer"
          >
            {hasTimer && secondsLeft > 0 ? 'Done together' : 'Mark complete with Olie'}
          </button>
        </div>
      </div>
    </div>
  );
}
