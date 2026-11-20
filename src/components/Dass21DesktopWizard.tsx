import { useState } from 'react';
import {
  ArrowLeft,
  Check,
  CloudRain,
  Download,
  Droplets,
  Heart,
  RotateCcw,
  Sparkles,
  Sun,
  Trees,
  Volume2,
  VolumeX,
  Waves,
  Wind,
} from 'lucide-react';
import {
  CLINICAL_DISCLAIMER,
  DASS21_QUESTIONS,
  FRIENDLY_CATEGORY_LABELS,
  RESPONSE_OPTIONS,
  calculateDass21Results,
  getGentleStatus,
} from '../data/dass21Data';
import { MiniCompanionFace } from './CompanionMascots';
import { OlieCharacter } from './OlieCharacter';
import {
  KINDNESS_ACTIVITIES,
  KindnessActivity,
  KindnessActivityModal,
} from './KindnessActivityModal';
import { AmbientSoundType, soundEngine } from '../utils/soundEngine';
import { submitCheckInResponse } from '../firebase';
import { downloadColorfulSummaryPdf } from '../utils/summaryReportPdf';

export type WizardScreen = 'profile' | 'sound' | 'questions' | 'results';

interface WizardProps {
  answers: Record<number, 0 | 1 | 2 | 3>;
  onAnswersChange: (next: Record<number, 0 | 1 | 2 | 3>) => void;
  participantName: string;
  onNameChange: (name: string) => void;
  participantAge: string;
  onAgeChange: (age: string) => void;
  selectedSound: AmbientSoundType;
  onSoundChange: (sound: AmbientSoundType) => void;
  ambientVolume: number;
  ambientMuted: boolean;
  onVolumeChange: (pct: number) => void;
  onToggleMute: () => void;
  onOpenBreather: () => void;
}

const SOUND_CHOICES: {
  id: AmbientSoundType;
  label: string;
  subtitle: string;
  tileBg: string;
  iconBg: string;
}[] = [
  {
    id: 'rain',
    label: 'Calm Rain',
    subtitle: 'Soft steady rainfall',
    tileBg: 'bg-[#D6EDFF] border-[#96CEFA] hover:border-[#4D2EEB]',
    iconBg: 'bg-[#1D74D8] text-white',
  },
  {
    id: 'waves',
    label: 'Ocean Waves',
    subtitle: 'Gentle shoreline swells',
    tileBg: 'bg-[#C9F5E5] border-[#7FDDBB] hover:border-[#4D2EEB]',
    iconBg: 'bg-[#0E9468] text-white',
  },
  {
    id: 'forest',
    label: 'Forest Breeze',
    subtitle: 'Quiet leaves in the wind',
    tileBg: 'bg-[#E1F8B8] border-[#A7DF50] hover:border-[#4D2EEB]',
    iconBg: 'bg-[#46820B] text-white',
  },
  {
    id: 'none',
    label: 'None',
    subtitle: 'Complete quiet',
    tileBg: 'bg-[#ECEEF5] border-[#C9CFDF] hover:border-[#4D2EEB]',
    iconBg: 'bg-[#42485B] text-white',
  },
];

const OPTION_CARD_TONES = [
  'bg-[#D6EDFF] border-[#96CEFA] hover:bg-[#C4E4FF] hover:border-[#4D2EEB]',
  'bg-[#FFEBA0] border-[#F0CA4A] hover:bg-[#FFE37D] hover:border-[#4D2EEB]',
  'bg-[#FFD1E3] border-[#F29BC0] hover:bg-[#FFC0D8] hover:border-[#4D2EEB]',
  'bg-[#E0D6FF] border-[#B29EFF] hover:bg-[#D2C4FF] hover:border-[#4D2EEB]',
];

export function Dass21DesktopWizard({
  answers,
  onAnswersChange,
  participantName,
  onNameChange,
  participantAge,
  onAgeChange,
  selectedSound,
  onSoundChange,
  ambientVolume,
  ambientMuted,
  onVolumeChange,
  onToggleMute,
  onOpenBreather,
}: WizardProps) {
  const [screen, setScreen] = useState<WizardScreen>('profile');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [olieCustomTip, setOlieCustomTip] = useState<string | null>(null);
  const [olieExcited, setOlieExcited] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [savedNotice, setSavedNotice] = useState('');
  const [savingSummary, setSavingSummary] = useState(false);
  const [kindnessDone, setKindnessDone] = useState<KindnessActivity['id'][]>([]);
  const [activeActivity, setActiveActivity] = useState<KindnessActivity | null>(null);
  const [submissionSaved, setSubmissionSaved] = useState(false);

  const currentQuestion = DASS21_QUESTIONS[currentIndex];
  const selectedScore = answers[currentQuestion.no];
  const results = calculateDass21Results(answers);
  const progressPct = Math.round(((currentIndex + 1) / DASS21_QUESTIONS.length) * 100);

  const cleanName = participantName.trim();

  // Olie acts as a warm, attentive digital test administrator across steps
  const getOlieAdministratorLine = (): string => {
    if (olieCustomTip) return olieCustomTip;
    const greeting = cleanName ? `${cleanName}, ` : '';
    if (currentIndex === 0) {
      return `Hi ${cleanName || 'friend'}, I am Olie. Let us go through these one at a time.`;
    }
    if (currentIndex < 7) {
      return `${greeting}take your time. Pick whichever answer feels closest to your week.`;
    }
    if (currentIndex < 14) {
      return `${greeting}you are doing really well. Pause for a breath anytime you need one.`;
    }
    if (currentIndex < 20) {
      return `${greeting}only a few questions left now. There is no rush at all.`;
    }
    return `Final question, ${cleanName || 'friend'}. Take a comfortable breath when you finish.`;
  };

  const handleProfileContinue = () => {
    soundEngine.playClick(300);
    const trimmedAge = participantAge.trim();
    if (!cleanName) {
      setProfileError('Please enter your name so Olie knows how to greet you.');
      return;
    }
    if (
      !trimmedAge ||
      Number.isNaN(Number(trimmedAge)) ||
      Number(trimmedAge) < 10 ||
      Number(trimmedAge) > 120
    ) {
      setProfileError('Please enter a valid age.');
      return;
    }
    setProfileError('');
    setScreen('sound');
  };

  const handlePickSound = (sound: AmbientSoundType) => {
    soundEngine.playClick(300);
    onSoundChange(sound);
    if (sound !== 'none' && ambientMuted) {
      onToggleMute();
    }
    soundEngine.setAmbientVolume(ambientVolume / 100);
    soundEngine.setSound(sound);
  };

  const handleBeginQuestions = () => {
    soundEngine.playClick(320);
    soundEngine.setAmbientVolume(ambientVolume / 100);
    soundEngine.setAmbientMuted(ambientMuted);
    soundEngine.setSound(selectedSound);
    setOlieCustomTip(null);
    setCurrentIndex(0);
    setScreen('questions');
  };

  const handleSelectOption = (score: 0 | 1 | 2 | 3) => {
    soundEngine.playSelect();
    setOlieCustomTip(null);
    onAnswersChange({ ...answers, [currentQuestion.no]: score });
    setOlieExcited(true);
    window.setTimeout(() => setOlieExcited(false), 580);
  };

  const handleTapOlie = () => {
    soundEngine.playClick(310);
    const tips = [
      `I am Olie, your guide. Answer honestly at whatever pace feels best.`,
      `There are no right or wrong answers. Every response stays private.`,
      `If a question feels heavy, tap Take a Breather and we can pause together.`,
    ];
    const nextTip = tips[(currentIndex + Math.floor(Math.random() * tips.length)) % tips.length];
    setOlieCustomTip(nextTip);
    setOlieExcited(true);
    window.setTimeout(() => setOlieExcited(false), 580);
  };

  const handleStartActivity = (activity: KindnessActivity) => {
    soundEngine.playSelect();
    setActiveActivity(activity);
  };

  const handleCompleteActivity = (id: KindnessActivity['id']) => {
    setKindnessDone((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setActiveActivity(null);
  };

  const handleDownloadSummary = async () => {
    if (savingSummary) return;
    soundEngine.playClick(300);
    setSavingSummary(true);
    try {
      await downloadColorfulSummaryPdf({
        participantName: cleanName,
        participantAge: participantAge.trim(),
        results,
        completedActivities: kindnessDone,
      });
      setSavedNotice('Your colorful summary PDF is saved.');
    } catch (err) {
      console.error('Could not build PDF summary:', err);
      setSavedNotice('Please try saving again.');
    } finally {
      setSavingSummary(false);
    }
  };

  const handleRestart = () => {
    soundEngine.playClick(280);
    onAnswersChange({});
    setCurrentIndex(0);
    setOlieCustomTip(null);
    setSavedNotice('');
    setSubmissionSaved(false);
    setKindnessDone([]);
    setActiveActivity(null);
    setScreen('profile');
  };

  const cardSurfaceVariants: ('yellow' | 'pink' | 'blue')[] = ['yellow', 'pink', 'blue'];
  const cardBgVariants = [
    'bg-[#FFE56E] border-[#ECC732]',
    'bg-[#FFB9D5] border-[#EE8CB4]',
    'bg-[#96D8FF] border-[#5BB7F2]',
  ];

  const renderSoundIcon = (id: AmbientSoundType, active: boolean, iconBg: string) => {
    const cls = `w-5 h-5 ${active ? 'text-[#7F62FF]' : ''}`;
    const wrapperCls = `w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
      active ? 'bg-white' : iconBg
    }`;
    if (id === 'rain') {
      return (
        <span className={wrapperCls}>
          <CloudRain className={cls} />
        </span>
      );
    }
    if (id === 'waves') {
      return (
        <span className={wrapperCls}>
          <Waves className={cls} />
        </span>
      );
    }
    if (id === 'forest') {
      return (
        <span className={wrapperCls}>
          <Trees className={cls} />
        </span>
      );
    }
    return (
      <span className={wrapperCls}>
        <VolumeX className={cls} />
      </span>
    );
  };

  const renderActivityIcon = (id: KindnessActivity['id']) => {
    if (id === 'water') {
      return (
        <span className="w-10 h-10 rounded-xl bg-[#1D74D8] text-white flex items-center justify-center shrink-0">
          <Droplets className="w-5 h-5" />
        </span>
      );
    }
    if (id === 'shoulders') {
      return (
        <span className="w-10 h-10 rounded-xl bg-[#5938EE] text-white flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </span>
      );
    }
    if (id === 'window') {
      return (
        <span className="w-10 h-10 rounded-xl bg-[#E08A00] text-white flex items-center justify-center shrink-0">
          <Sun className="w-5 h-5" />
        </span>
      );
    }
    return (
      <span className="w-10 h-10 rounded-xl bg-[#D63672] text-white flex items-center justify-center shrink-0">
        <Heart className="w-5 h-5" />
      </span>
    );
  };

  return (
    <div className="w-full max-w-[1160px] mx-auto relative z-10">
      {/* SCREEN 1A: RESPONSIVE WELCOME PROFILE WITH RICH WELLBEING INDIGO SKY */}
      {screen === 'profile' && (
        <div className="rounded-[34px] overflow-hidden bg-white border border-[#D8DCEB] shadow-[0_24px_60px_rgba(30,32,40,0.10)] grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Rich Indigo Sky + Sun + Olie Column */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#231073] via-[#4528B8] to-[#6B4EFF] pt-8 px-6 flex flex-col justify-between overflow-hidden">
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-white pb-2">
              <span>Calm weekly check in</span>
              <span aria-hidden="true">·</span>
              <span>Private to you</span>
              <span aria-hidden="true">·</span>
              <span>About 3 minutes</span>
            </div>
            <div className="pt-2">
              <OlieCharacter mood="welcome" />
            </div>
          </div>

          {/* Spacious Greeting & Profile Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center space-y-6">
            <div>
              <div className="text-sm font-bold tracking-wide text-[#4D2EEB]">
                Guided by Olie
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#11131D] tracking-tight mt-1 text-balance">
                Hi, I am Olie
              </h1>
              <p className="text-base text-[#2B3040] mt-2.5 leading-relaxed max-w-lg">
                I will gently walk with you through a short weekly check in. Tell me a little about you so I can greet you properly.
              </p>
            </div>

            <div className="space-y-4 max-w-lg">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="olie-name"
                    className="block text-sm font-bold text-[#11131D] mb-1.5"
                  >
                    Your name
                  </label>
                  <input
                    id="olie-name"
                    type="text"
                    value={participantName}
                    onChange={(e) => {
                      setProfileError('');
                      onNameChange(e.target.value);
                    }}
                    placeholder="First name"
                    className="w-full h-12 px-4 rounded-2xl bg-[#F4F6FC] border border-[#CFD5E6] text-base font-medium text-[#11131D] placeholder:text-[#666C7E] focus:outline-none focus:border-[#4D2EEB]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="olie-age"
                    className="block text-sm font-bold text-[#11131D] mb-1.5"
                  >
                    Your age
                  </label>
                  <input
                    id="olie-age"
                    type="number"
                    min={10}
                    max={120}
                    value={participantAge}
                    onChange={(e) => {
                      setProfileError('');
                      onAgeChange(e.target.value);
                    }}
                    placeholder="Age"
                    className="w-full h-12 px-4 rounded-2xl bg-[#F4F6FC] border border-[#CFD5E6] text-base font-medium text-[#11131D] tabular-nums placeholder:text-[#666C7E] focus:outline-none focus:border-[#4D2EEB]"
                  />
                </div>
              </div>

              {profileError && (
                <p className="text-sm font-semibold text-[#B42318]">{profileError}</p>
              )}

              <button
                type="button"
                onClick={handleProfileContinue}
                className="w-full h-13 rounded-full bg-[#4D2EEB] hover:bg-[#3E22CE] text-white text-base font-bold shadow-[0_10px_24px_rgba(77,46,235,0.28)] transition-colors cursor-pointer whitespace-nowrap"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 1B: COLORFUL SOUND SELECTION BENTO */}
      {screen === 'sound' && (
        <div className="rounded-[34px] overflow-hidden bg-white border border-[#D8DCEB] shadow-[0_24px_60px_rgba(30,32,40,0.10)] grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Rich Indigo Olie Stage */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#231073] to-[#4629BF] px-6 sm:px-8 py-8 flex flex-col items-center justify-center text-center gap-4">
            <OlieCharacter
              mood="admin"
              excited={olieExcited}
              onTap={() => {
                soundEngine.playClick(310);
                setOlieExcited(true);
                window.setTimeout(() => setOlieExcited(false), 580);
              }}
            />
            <div className="bg-white rounded-2xl px-5 py-4 shadow-md max-w-sm">
              <div className="text-xs font-bold tracking-wide text-[#4D2EEB]">
                Olie, Digital Guide
              </div>
              <p className="text-base font-bold text-[#11131D] mt-1">
                Nice to meet you, {cleanName}.
              </p>
              <p className="text-sm font-medium text-[#2B3040] mt-1 leading-relaxed">
                Pick a calming background sound while we go through the questions together.
              </p>
            </div>
          </div>

          {/* Right Sound Grid + Volume & Mute Bar */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#11131D]">
                Set your calm atmosphere
              </h2>
              <p className="text-[15px] font-medium text-[#2B3040] mt-1">
                You can switch sounds, adjust volume, or mute anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {SOUND_CHOICES.map((choice) => {
                const active = selectedSound === choice.id;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => handlePickSound(choice.id)}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer min-h-[76px] ${
                      active
                        ? 'bg-[#4D2EEB] border-[#3B1EC9] text-white shadow-[0_10px_24px_rgba(77,46,235,0.28)]'
                        : `${choice.tileBg} text-[#11131D]`
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {renderSoundIcon(choice.id, active, choice.iconBg)}
                      <div>
                        <div className="text-base font-bold">{choice.label}</div>
                        <div
                          className={`text-xs font-medium mt-0.5 ${
                            active ? 'text-white/95' : 'text-[#2B3040]'
                          }`}
                        >
                          {choice.subtitle}
                        </div>
                      </div>
                    </div>

                    {active && (
                      <span className="w-6 h-6 rounded-full bg-white text-[#4D2EEB] flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Volume Slider and Mute / Unmute Controls */}
            <div className="rounded-2xl bg-[#F2F4FB] border border-[#CFD5E6] px-4 py-3.5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={selectedSound === 'none'}
                  aria-pressed={ambientMuted}
                  onClick={onToggleMute}
                  className={`h-10 px-4 rounded-full border text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
                    selectedSound === 'none'
                      ? 'bg-[#E5E8F2] border-[#CFD5E6] text-[#686E82] cursor-not-allowed'
                      : ambientMuted
                        ? 'bg-[#231073] border-[#231073] text-white cursor-pointer'
                        : 'bg-white border-[#C6CCDE] text-[#11131D] hover:border-[#4D2EEB] cursor-pointer'
                  }`}
                >
                  {ambientMuted || selectedSound === 'none' ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-[#4D2EEB]" />
                  )}
                  <span>{ambientMuted ? 'Unmute' : 'Mute'}</span>
                </button>
                <span className="text-xs font-semibold text-[#2B3040]">
                  {selectedSound === 'none'
                    ? 'Quiet mode active'
                    : ambientMuted
                      ? 'Background sound muted'
                      : 'Adjust background volume'}
                </span>
              </div>

              <div className="flex items-center gap-3 flex-1 min-w-[190px] max-w-[260px]">
                <label htmlFor="sound-volume-slider" className="sr-only">
                  Background sound volume
                </label>
                <input
                  id="sound-volume-slider"
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  disabled={selectedSound === 'none'}
                  value={selectedSound === 'none' || ambientMuted ? 0 : ambientVolume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="w-full h-2 rounded-full accent-[#4D2EEB] bg-[#CFD5E6] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                />
                <span className="text-xs font-bold font-mono tabular-nums text-[#11131D] w-10 text-right">
                  {selectedSound === 'none' || ambientMuted ? '0%' : `${ambientVolume}%`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick(280);
                  setScreen('profile');
                }}
                className="h-12 px-5 rounded-full border border-[#C6CCDE] text-sm font-bold text-[#11131D] hover:bg-[#F4F6FC] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <button
                type="button"
                onClick={handleBeginQuestions}
                className="flex-1 max-w-xs h-12 rounded-full bg-[#B8F23B] hover:bg-[#A9E42A] text-[#11131D] text-base font-bold shadow-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                Begin with Olie
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 2: SPACIOUS 12-COLUMN WELLBEING BENTO WORKSPACE */}
      {screen === 'questions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
          {/* LEFT PANEL: Deep Wellbeing Indigo Stage with Sunny Olie & Audio Tray */}
          <aside className="lg:col-span-4 rounded-[32px] bg-gradient-to-b from-[#231073] to-[#4125B8] border border-[#341B99] shadow-[0_20px_50px_rgba(30,32,40,0.14)] p-5 sm:p-6 flex flex-col justify-between gap-5">
            <div className="flex flex-col items-center text-center gap-3 overflow-visible">
              <OlieCharacter
                mood="admin"
                onTap={handleTapOlie}
                excited={olieExcited}
              />
              <div className="w-full bg-white rounded-2xl px-4 py-3.5 shadow-md min-h-[84px] flex flex-col justify-center">
                <div className="text-xs font-bold tracking-wide text-[#4D2EEB]">
                  Olie, Digital Check In Guide
                </div>
                <p className="text-[15px] font-semibold text-[#11131D] mt-1 leading-snug">
                  {getOlieAdministratorLine()}
                </p>
              </div>
            </div>

            {/* Sound Switcher, Mute, Volume & Breather Controls */}
            <div className="space-y-3">
              <div className="bg-white/14 rounded-2xl p-3 border border-white/20 space-y-2.5">
                <div className="grid grid-cols-4 gap-1 bg-[#1A0B5A]/55 rounded-xl p-1">
                  {(['rain', 'waves', 'forest', 'none'] as AmbientSoundType[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handlePickSound(s)}
                      className={`py-1.5 px-1 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer whitespace-nowrap ${
                        selectedSound === s
                          ? 'bg-[#B8F23B] text-[#11131D] shadow-xs'
                          : 'text-white/90 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {selectedSound !== 'none' && (
                  <div className="flex items-center justify-between gap-2.5 px-1">
                    <button
                      type="button"
                      aria-pressed={ambientMuted}
                      aria-label={ambientMuted ? 'Unmute background sound' : 'Mute background sound'}
                      onClick={onToggleMute}
                      className={`h-8 px-3 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                        ambientMuted
                          ? 'bg-[#FFE56E] text-[#11131D]'
                          : 'bg-white text-[#11131D] hover:bg-[#EAE6FF]'
                      }`}
                    >
                      {ambientMuted ? (
                        <VolumeX className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 text-[#4D2EEB]" />
                      )}
                      <span>{ambientMuted ? 'Unmute' : 'Mute'}</span>
                    </button>
                    <input
                      type="range"
                      aria-label="Ambient volume"
                      min={0}
                      max={100}
                      step={1}
                      value={ambientMuted ? 0 : ambientVolume}
                      onChange={(e) => onVolumeChange(Number(e.target.value))}
                      className="flex-1 h-1.5 accent-[#B8F23B] cursor-pointer"
                    />
                    <span className="text-xs font-bold font-mono tabular-nums text-white w-9 text-right">
                      {ambientMuted ? '0%' : `${ambientVolume}%`}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick(300);
                  onOpenBreather();
                }}
                className="w-full h-11 px-4 rounded-full bg-[#B8F23B] hover:bg-[#A9E42A] text-[#11131D] text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Wind className="w-4 h-4 text-[#11131D]" />
                Take a Breather
              </button>
            </div>
          </aside>

          {/* RIGHT PANEL: CRISP QUESTION & COLORFUL WELLBEING ANSWER CARDS */}
          <section className="lg:col-span-8 rounded-[32px] bg-white border border-[#D8DCEB] shadow-[0_20px_50px_rgba(30,32,40,0.09)] p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-6">
            {/* Top Progress Strip */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-[#11131D] tabular-nums">
                  Question {currentIndex + 1} of {DASS21_QUESTIONS.length}
                </span>
                <span className="text-sm font-bold text-[#4D2EEB] font-mono tabular-nums">
                  {progressPct}%
                </span>
              </div>
              <svg
                viewBox="0 0 100 3.5"
                className="w-full h-3 rounded-full overflow-hidden"
                aria-label={`Progress ${progressPct}%`}
              >
                <rect x="0" y="0" width="100" height="3.5" rx="1.75" fill="#E3E6F2" />
                <rect x="0" y="0" width={progressPct} height="3.5" rx="1.75" fill="#4D2EEB" />
              </svg>
            </div>

            {/* Fixed-Height Question Box with justify-start so explanation stays tightly below the question */}
            <div className="min-h-[144px] sm:min-h-[124px] flex flex-col justify-start gap-2.5 pt-1">
              <h2 className="font-display text-2xl sm:text-[26px] font-bold text-[#11131D] leading-snug text-balance">
                {currentQuestion.statement}
              </h2>
              <p className="text-base font-medium text-[#2B3040]">
                How often did this happen over the past week?
              </p>
            </div>

            {/* Uniform Height Colorful Tactile Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {RESPONSE_OPTIONS.map((opt, idx) => {
                const isSelected = selectedScore === opt.score;
                return (
                  <button
                    key={opt.score}
                    type="button"
                    onClick={() => handleSelectOption(opt.score)}
                    className={`h-[68px] text-left px-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#4D2EEB] border-[#3B1EC9] text-white shadow-[0_10px_24px_rgba(77,46,235,0.28)]'
                        : `${OPTION_CARD_TONES[idx]} text-[#11131D]`
                    }`}
                  >
                    <span className="text-base font-bold">{opt.title}</span>
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white text-[#4D2EEB]' : 'bg-white border border-[#B8BFD4]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Navigation */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => {
                  soundEngine.playClick(280);
                  setOlieCustomTip(null);
                  setCurrentIndex((i) => Math.max(0, i - 1));
                }}
                className={`h-12 px-5 rounded-full border text-sm font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  currentIndex === 0
                    ? 'border-[#E6E9F2] text-[#A2A8BA] cursor-not-allowed'
                    : 'border-[#C6CCDE] text-[#11131D] hover:bg-[#F4F6FC] cursor-pointer'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <button
                type="button"
                disabled={selectedScore === undefined}
                onClick={() => {
                  if (selectedScore === undefined) return;
                  setOlieCustomTip(null);
                  if (currentIndex < DASS21_QUESTIONS.length - 1) {
                    soundEngine.playClick(320);
                    setCurrentIndex((i) => i + 1);
                  } else {
                    soundEngine.playCelebrate();
                    if (!submissionSaved) {
                      setSubmissionSaved(true);
                      void submitCheckInResponse({
                        participantName,
                        participantAge,
                        ambientSound: selectedSound,
                        answers,
                      }).catch((err) => {
                        console.error('Failed to save check-in response:', err);
                      });
                    }
                    setScreen('results');
                  }
                }}
                className={`flex-1 max-w-xs h-12 rounded-full text-sm font-bold tracking-wide uppercase transition-all whitespace-nowrap ${
                  selectedScore === undefined
                    ? 'bg-[#E5E8F2] text-[#686E82] cursor-not-allowed'
                    : 'bg-[#B8F23B] hover:bg-[#A9E42A] text-[#11131D] shadow-sm cursor-pointer'
                }`}
              >
                {currentIndex === DASS21_QUESTIONS.length - 1
                  ? 'Finish Check In'
                  : 'Continue'}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* SCREEN 3: COLORFUL WIDE CELEBRATION & BENTO SUMMARY */}
      {screen === 'results' && (
        <div className="rounded-[34px] overflow-hidden bg-white border border-[#D8DCEB] shadow-[0_24px_60px_rgba(30,32,40,0.10)]">
          <div className="bg-gradient-to-r from-[#231073] via-[#4528B8] to-[#6B4EFF] px-6 sm:px-10 pt-6 pb-8 text-center text-white relative">
            {selectedSound !== 'none' && (
              <div className="flex justify-end mb-2">
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-xs border border-white/25 rounded-full px-3 py-1">
                  <button
                    type="button"
                    aria-pressed={ambientMuted}
                    aria-label={ambientMuted ? 'Unmute background sound' : 'Mute background sound'}
                    onClick={onToggleMute}
                    className="flex items-center gap-1.5 text-xs font-semibold text-white cursor-pointer"
                  >
                    {ambientMuted ? (
                      <VolumeX className="w-3.5 h-3.5" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                    <span>{ambientMuted ? 'Unmute' : 'Mute'}</span>
                  </button>
                  <input
                    type="range"
                    aria-label="Background sound volume"
                    min={0}
                    max={100}
                    step={1}
                    value={ambientMuted ? 0 : ambientVolume}
                    onChange={(e) => onVolumeChange(Number(e.target.value))}
                    className="w-16 h-1.5 accent-[#B8F23B] cursor-pointer"
                  />
                </div>
              </div>
            )}

            <OlieCharacter mood="celebrate" />
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-1">
              {cleanName ? `Congratulations, ${cleanName}!` : 'You made it through!'}
            </h2>
            <p className="text-base text-white/95 mt-2 max-w-lg mx-auto font-medium">
              Olie and friends are proud of you for taking a gentle pause for yourself today.
            </p>
          </div>

          <div className="p-6 sm:p-8 lg:p-10 space-y-6">
            {/* 3 Colorful Mood Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
              {results.map((res, idx) => (
                <div
                  key={res.category}
                  className={`rounded-3xl border p-6 flex flex-col justify-between gap-5 ${cardBgVariants[idx]}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-lg font-bold text-[#11131D]">
                      {FRIENDLY_CATEGORY_LABELS[res.category]}
                    </h3>
                    <MiniCompanionFace variant={cardSurfaceVariants[idx]} />
                  </div>

                  <div>
                    <div className="text-xl font-display font-bold text-[#11131D]">
                      {getGentleStatus(res.severity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Desktop 12-Col Bento Split: Activities + Support & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              <div className="lg:col-span-7 bg-[#F2F4FB] rounded-3xl p-6 border border-[#CFD5E6]">
                <h3 className="font-display text-lg font-bold text-[#11131D]">
                  Pick a small kindness to do together with Olie
                </h3>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {KINDNESS_ACTIVITIES.map((activity) => {
                    const checked = kindnessDone.includes(activity.id);
                    return (
                      <button
                        key={activity.id}
                        type="button"
                        onClick={() => handleStartActivity(activity)}
                        className={`text-left px-4 py-3.5 rounded-2xl border text-sm font-bold flex items-center gap-3 transition-colors cursor-pointer ${
                          checked
                            ? 'bg-[#D7F7B2] border-[#82CF38] text-[#11131D]'
                            : 'bg-white border-[#CFD5E6] text-[#11131D] hover:border-[#4D2EEB] hover:bg-[#FAF9FF]'
                        }`}
                      >
                        {renderActivityIcon(activity.id)}
                        <span className="flex-1 leading-snug">{activity.title}</span>
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            checked
                              ? 'bg-[#11131D] text-white'
                              : 'border border-[#B8BFD4] bg-white'
                          }`}
                        >
                          {checked && <Check className="w-3 h-3" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                <div className="rounded-3xl bg-[#EAE6FF] border border-[#C6BCF8] p-6 text-sm text-[#2B3040] font-medium leading-relaxed flex-1 flex flex-col justify-center">
                  <span className="font-bold text-[#11131D] text-base mb-1">Remember</span>
                  <p>{CLINICAL_DISCLAIMER}</p>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="h-12 px-5 rounded-full bg-white border border-[#C6CCDE] text-sm font-bold text-[#11131D] hover:bg-[#F4F6FC] flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Start Over
                  </button>
                  <button
                    type="button"
                    disabled={savingSummary}
                    onClick={handleDownloadSummary}
                    className="h-12 px-6 rounded-full bg-[#4D2EEB] hover:bg-[#3E22CE] disabled:opacity-70 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(77,46,235,0.24)] transition-all cursor-pointer whitespace-nowrap flex-1"
                  >
                    <Download className="w-4 h-4" />
                    {savingSummary ? 'Creating Summary...' : 'Save My Summary'}
                  </button>
                </div>
                {savedNotice && (
                  <p className="text-sm font-bold text-[#4D2EEB] text-center sm:text-right">
                    {savedNotice}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Olie Companion Modal for End Activities */}
      <KindnessActivityModal
        activity={activeActivity}
        participantName={cleanName}
        onClose={() => setActiveActivity(null)}
        onComplete={handleCompleteActivity}
      />
    </div>
  );
}
