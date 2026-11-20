import { useEffect, useState } from 'react';
import { Check, Droplets, RotateCcw, Play, Pause, Save, Trash2 } from 'lucide-react';
import { AccentPaletteId, DesignConfig, FontScale, PaddingScale, RadiusScale } from '../types/studio';
import { TEMPLATES } from '../data/palettes';

interface DesktopPreviewProps {
  config: DesignConfig;
  showTkinterContrast: boolean;
  onToggleContrast: (next: boolean) => void;
}

const ACCENT_CLASSES: Record<
  AccentPaletteId,
  {
    btn: string;
    fillHex: string;
    textAccent: string;
    softLight: string;
    softDark: string;
    borderAccent: string;
  }
> = {
  ocean: {
    btn: 'bg-blue-600 hover:bg-blue-700 text-white',
    fillHex: '#2563EB',
    textAccent: 'text-blue-600',
    softLight: 'bg-blue-50',
    softDark: 'bg-blue-950/60',
    borderAccent: 'border-blue-600',
  },
  sage: {
    btn: 'bg-teal-600 hover:bg-teal-700 text-white',
    fillHex: '#0D9488',
    textAccent: 'text-teal-600',
    softLight: 'bg-teal-50',
    softDark: 'bg-teal-950/60',
    borderAccent: 'border-teal-600',
  },
  indigo: {
    btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    fillHex: '#4F46E5',
    textAccent: 'text-indigo-600',
    softLight: 'bg-indigo-50',
    softDark: 'bg-indigo-950/60',
    borderAccent: 'border-indigo-600',
  },
  forest: {
    btn: 'bg-green-700 hover:bg-green-800 text-white',
    fillHex: '#15803D',
    textAccent: 'text-green-700',
    softLight: 'bg-green-50',
    softDark: 'bg-green-950/60',
    borderAccent: 'border-green-700',
  },
};

const PAD_CLASS: Record<PaddingScale, string> = {
  16: 'p-4',
  24: 'p-6',
  32: 'p-8',
};

const GAP_CLASS: Record<PaddingScale, string> = {
  16: 'gap-4',
  24: 'gap-5',
  32: 'gap-7',
};

const RADIUS_CLASS: Record<RadiusScale, string> = {
  10: 'rounded-[10px]',
  16: 'rounded-2xl',
  20: 'rounded-[20px]',
};

const BTN_RADIUS_CLASS: Record<RadiusScale, string> = {
  10: 'rounded-md',
  16: 'rounded-xl',
  20: 'rounded-2xl',
};

const TYPE_SCALE: Record<
  FontScale,
  { title: string; section: string; body: string; caption: string }
> = {
  standard: {
    title: 'text-[22px] leading-tight',
    section: 'text-[16px] leading-snug',
    body: 'text-[14px] leading-relaxed',
    caption: 'text-[12px] leading-normal',
  },
  accessible: {
    title: 'text-[25px] leading-tight',
    section: 'text-[18px] leading-snug',
    body: 'text-[15.5px] leading-relaxed',
    caption: 'text-[13px] leading-normal',
  },
};

const ENERGY_COPY: Record<string, { minutes: number; text: string }> = {
  Calm: {
    minutes: 25,
    text: 'You feel grounded. A steady 25-minute block will flow naturally.',
  },
  Steady: {
    minutes: 25,
    text: 'Take one clear priority at a time. Small progress is real progress.',
  },
  Stretched: {
    minutes: 15,
    text: 'Be gentle with yourself today. Try a lighter 15-minute pace and hydrate.',
  },
};

export function DesktopPreview({
  config,
  showTkinterContrast,
  onToggleContrast,
}: DesktopPreviewProps) {
  const template = TEMPLATES.find((t) => t.id === config.templateId)!;
  const isDark = config.appearanceMode === 'dark';
  const accent = ACCENT_CLASSES[config.accentId];
  const pad = PAD_CLASS[config.cardPadding];
  const gap = GAP_CLASS[config.cardPadding];
  const radius = RADIUS_CLASS[config.cornerRadius];
  const btnRadius = BTN_RADIUS_CLASS[config.cornerRadius];
  const type = TYPE_SCALE[config.fontScale];

  const canvasBg = isDark ? 'bg-slate-900' : 'bg-[#F4F6F9]';
  const cardBg = isDark
    ? 'bg-slate-800 border-slate-700'
    : 'bg-white border-slate-200';
  const subtleBg = isDark
    ? 'bg-slate-900/70 border-slate-700/70'
    : 'bg-slate-50 border-slate-200/80';
  const textPrimary = isDark ? 'text-slate-50' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-600';
  const inputSurface = isDark
    ? 'bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-500'
    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400';
  const softHighlight = isDark ? accent.softDark : accent.softLight;

  // --- Interactive State: Focus & Breath ---
  const [energy, setEnergy] = useState<'Calm' | 'Steady' | 'Stretched'>('Steady');
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [intention, setIntention] = useState('');
  const [intentionSaved, setIntentionSaved] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRunning]);

  const handleEnergySelect = (choice: 'Calm' | 'Steady' | 'Stretched') => {
    setEnergy(choice);
    if (!isRunning) {
      const secs = ENERGY_COPY[choice].minutes * 60;
      setTotalSeconds(secs);
      setRemainingSeconds(secs);
    }
  };

  // --- Interactive State: Care Log ---
  const [careItems, setCareItems] = useState([
    { id: 1, label: 'Morning medication with breakfast', time: '8:00 AM', done: true },
    { id: 2, label: 'Short 10-minute stretch or walk', time: '10:30 AM', done: false },
    { id: 3, label: 'Afternoon check-in & quiet screen break', time: '2:00 PM', done: false },
    { id: 4, label: 'Evening wind-down & prep for tomorrow', time: '8:30 PM', done: false },
  ]);
  const [waterGlasses, setWaterGlasses] = useState(3);
  const [careNote, setCareNote] = useState('Slept well, pacing afternoon calls slowly.');

  // --- Interactive State: Client Notes ---
  const [clients, setClients] = useState([
    {
      name: 'Maya Lin',
      meta: 'Session 06 · Weekly Check-in',
      notes: 'Focused on pacing workload and setting clear evening boundaries.',
      followup: true,
    },
    {
      name: 'David Okafor',
      meta: 'Session 03 · Career Transition',
      notes: 'Reviewed portfolio drafts; next step is reaching out to two mentors.',
      followup: false,
    },
    {
      name: 'Elena Rostova',
      meta: 'Session 11 · Study Coaching',
      notes: 'Practiced breaking thesis chapters into 30-minute calm blocks.',
      followup: false,
    },
  ]);
  const [activeClientIdx, setActiveClientIdx] = useState(0);
  const [noteSavedToast, setNoteSavedToast] = useState(false);

  // --- Interactive State: Calm Budget ---
  const monthlyIncome = 4200;
  const [envelopes, setEnvelopes] = useState([
    { name: 'Essentials & Home', amount: 1950 },
    { name: 'Groceries & Care', amount: 620 },
    { name: 'Personal Joy', amount: 340 },
    { name: 'Future Savings', amount: 650 },
  ]);
  const [budgetSaved, setBudgetSaved] = useState(false);

  const plannedTotal = envelopes.reduce((sum, e) => sum + e.amount, 0);
  const bufferAmount = monthlyIncome - plannedTotal;

  const mins = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const secs = String(remainingSeconds % 60).padStart(2, '0');
  const timerRatio = totalSeconds > 0 ? Math.round((remainingSeconds / totalSeconds) * 100) : 0;

  const completedCare = careItems.filter((c) => c.done).length;
  const careRatio = Math.round((completedCare / careItems.length) * 100);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-medium text-slate-700">{template.windowTitle}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{template.windowSize}px</span>
          <span aria-hidden="true">·</span>
          <span>{template.audience}</span>
        </div>

        <button
          type="button"
          onClick={() => onToggleContrast(!showTkinterContrast)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            showTkinterContrast
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {showTkinterContrast
            ? 'Back to CustomTkinter View'
            : 'Compare vs. Default Grey Tkinter'}
        </button>
      </div>

      {showTkinterContrast ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          {/* Anti-pattern: Default Grey Tkinter */}
          <div className="rounded-lg border-2 border-neutral-400 bg-[#d9d9d9] shadow-md overflow-hidden text-black font-sans">
            <div className="bg-[#c0c0c0] border-b border-neutral-500 px-2 py-1 flex items-center justify-between text-xs">
              <span>tk</span>
              <div className="flex gap-1">
                <span className="px-1.5 border border-neutral-600 bg-[#d9d9d9]">_</span>
                <span className="px-1.5 border border-neutral-600 bg-[#d9d9d9]">x</span>
              </div>
            </div>
            <div className="p-2 space-y-1.5 text-[12px]">
              <p className="font-bold">Focus Timer App v1</p>
              <div className="border border-neutral-500 p-1.5 bg-[#d9d9d9] space-y-1">
                <p>Time Left: 25:00</p>
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="px-2 py-0.5 bg-[#e1e1e1] border border-neutral-600 text-[11px]"
                  >
                    Start
                  </button>
                  <button
                    type="button"
                    className="px-2 py-0.5 bg-[#e1e1e1] border border-neutral-600 text-[11px]"
                  >
                    Stop
                  </button>
                  <button
                    type="button"
                    className="px-2 py-0.5 bg-[#e1e1e1] border border-neutral-600 text-[11px]"
                  >
                    Reset
                  </button>
                </div>
              </div>
              <div className="border border-neutral-500 p-1.5 space-y-1">
                <label className="block">Task Note:</label>
                <input
                  type="text"
                  defaultValue="Finish report"
                  className="w-full bg-white border border-neutral-600 px-1 py-0.5 text-[11px]"
                />
                <button
                  type="button"
                  className="px-2 py-0.5 bg-[#e1e1e1] border border-neutral-600 text-[11px]"
                >
                  Submit
                </button>
              </div>
              <p className="text-[11px] text-neutral-700">
                Why this fails users: zero padding, harsh #d9d9d9 grey, 1px beveled borders, tiny fonts, and no hierarchy.
              </p>
            </div>
          </div>

          {/* Explanation Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-900">
              What changes when you move to CustomTkinter
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>
                <span className="font-semibold text-slate-900">1. Breathing room over cramping:</span>{' '}
                Replacing <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">padx=2</code> with centralized{' '}
                <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">SPACING["card_pad_x"] = {config.cardPadding}</code>{' '}
                immediately removes visual anxiety.
              </li>
              <li>
                <span className="font-semibold text-slate-900">2. Intentional surface contrast:</span>{' '}
                Soft canvas neutral (<code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">#F4F6F9</code>) paired with clean{' '}
                <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">CTkFrame</code> cards replaces flat system grey.
              </li>
              <li>
                <span className="font-semibold text-slate-900">3. Clear typographic hierarchy:</span>{' '}
                Pairing bold section titles with muted helper copy guides the eye without screaming borders.
              </li>
              <li>
                <span className="font-semibold text-slate-900">4. Empathetic microcopy:</span>{' '}
                Controls explain what happens gently instead of barking robotic labels like &quot;Submit&quot; or &quot;Stop&quot;.
              </li>
            </ul>
          </div>
        </div>
      ) : (
        /* Realistic CustomTkinter Desktop Window */
        <div
          className={`rounded-2xl border shadow-sm overflow-hidden transition-colors duration-200 ${
            isDark ? 'border-slate-700' : 'border-slate-300'
          }`}
        >
          {/* OS Desktop Titlebar */}
          <div
            className={`px-4 py-2.5 border-b flex items-center justify-between ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-300'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400/80" aria-hidden="true" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80" aria-hidden="true" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/80" aria-hidden="true" />
            </div>
            <span className="text-xs font-medium tracking-tight">{template.windowTitle}</span>
            <span className="text-[11px] font-mono opacity-60">CTk</span>
          </div>

          {/* CTk Root Canvas */}
          <div className={`${canvasBg} ${pad} transition-colors duration-200`}>
            {config.templateId === 'focus-breath' && (
              <div className={`flex flex-col ${gap}`}>
                <div>
                  <h3 className={`font-display font-bold ${type.title} ${textPrimary}`}>
                    Good afternoon, take things one breath at a time
                  </h3>
                  <p className={`${type.body} ${textSecondary} mt-1`}>
                    A calm desktop space designed for unhurried focus without harsh alarms.
                  </p>
                </div>

                <div className={`grid grid-cols-1 lg:grid-cols-5 ${gap} items-stretch`}>
                  {/* Timer Card */}
                  <div
                    className={`lg:col-span-3 border ${cardBg} ${radius} ${pad} flex flex-col justify-between`}
                  >
                    <div>
                      <h4 className={`font-display font-semibold ${type.section} ${textPrimary}`}>
                        Current Focus Block
                      </h4>
                      <p className={`${type.caption} ${textSecondary} mt-1`}>
                        Pause or step away whenever you need to.
                      </p>
                    </div>

                    <div className="my-6 text-center">
                      <div
                        className={`font-display font-bold text-5xl tracking-tight tabular-nums ${textPrimary}`}
                      >
                        {mins}:{secs}
                      </div>
                      <div className="mt-4">
                        <svg
                          viewBox="0 0 100 4"
                          className="w-full h-2.5 rounded-full overflow-hidden"
                          aria-label="Focus session progress"
                        >
                          <rect
                            x="0"
                            y="0"
                            width="100"
                            height="4"
                            rx="2"
                            fill={isDark ? '#0F172A' : '#E2E8F0'}
                          />
                          <rect
                            x="0"
                            y="0"
                            width={timerRatio}
                            height="4"
                            rx="2"
                            fill={accent.fillHex}
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setIsRunning((r) => !r)}
                        className={`h-[42px] px-4 font-semibold ${type.body} ${btnRadius} ${accent.btn} flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap`}
                      >
                        {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {isRunning
                          ? 'Pause Session'
                          : remainingSeconds < totalSeconds
                            ? 'Resume Session'
                            : 'Start Session'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsRunning(false);
                          setRemainingSeconds(totalSeconds);
                        }}
                        className={`h-[42px] px-4 font-medium ${type.body} ${btnRadius} border ${subtleBg} ${textPrimary} hover:opacity-85 flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap`}
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Energy Check-In Card */}
                  <div className={`lg:col-span-2 border ${cardBg} ${radius} ${pad} flex flex-col`}>
                    <h4 className={`font-display font-semibold ${type.section} ${textPrimary}`}>
                      How is your energy?
                    </h4>
                    <p className={`${type.caption} ${textSecondary} mt-1`}>
                      Adjusts your session tone without judgment.
                    </p>

                    <div
                      className={`mt-4 grid grid-cols-3 gap-1 p-1 border ${subtleBg} ${btnRadius}`}
                    >
                      {(['Calm', 'Steady', 'Stretched'] as const).map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleEnergySelect(item)}
                          className={`py-2 text-xs font-semibold ${btnRadius} transition-colors cursor-pointer whitespace-nowrap ${
                            energy === item
                              ? accent.btn
                              : `${textSecondary} hover:opacity-80`
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>

                    <p className={`mt-4 ${type.body} ${textSecondary}`}>
                      {ENERGY_COPY[energy].text}
                    </p>
                  </div>
                </div>

                {/* Bottom Intention Card */}
                <div className={`border ${cardBg} ${radius} ${pad}`}>
                  <h4 className={`font-display font-semibold ${type.section} ${textPrimary}`}>
                    One gentle intention
                  </h4>
                  <p className={`${type.caption} ${textSecondary} mt-1`}>
                    What single task would feel satisfying to finish right now?
                  </p>
                  <div className="mt-3 flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={intention}
                      onChange={(e) => setIntention(e.target.value)}
                      placeholder="e.g., Outline the first two sections of my report..."
                      className={`flex-1 h-[42px] px-3.5 border ${inputSurface} ${btnRadius} ${type.body} focus:outline-none`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (intention.trim()) {
                          setIntentionSaved(true);
                          window.setTimeout(() => setIntentionSaved(false), 1800);
                        }
                      }}
                      className={`h-[42px] px-5 font-medium ${type.body} ${btnRadius} border ${subtleBg} ${textPrimary} hover:opacity-85 transition-colors cursor-pointer whitespace-nowrap shrink-0`}
                    >
                      {intentionSaved ? 'Saved!' : 'Set Intention'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {config.templateId === 'care-log' && (
              <div className={`flex flex-col ${gap}`}>
                <div>
                  <h3 className={`font-display font-bold ${type.title} ${textPrimary}`}>
                    Daily Care Check-In
                  </h3>
                  <p className={`${type.body} ${textSecondary} mt-1`}>
                    {completedCare} of {careItems.length} care moments completed today. Go at a comfortable pace.
                  </p>
                </div>

                <div className={`grid grid-cols-1 lg:grid-cols-5 ${gap} items-stretch`}>
                  <div className={`lg:col-span-3 border ${cardBg} ${radius} ${pad}`}>
                    <h4 className={`font-display font-semibold ${type.section} ${textPrimary}`}>
                      Today&apos;s Gentle Routine
                    </h4>
                    <p className={`${type.caption} ${textSecondary} mt-1`}>
                      Check off items at your own pace — missed items simply wait without penalty.
                    </p>

                    <div className="my-4">
                      <svg
                        viewBox="0 0 100 4"
                        className="w-full h-2.5 rounded-full overflow-hidden"
                        aria-label="Daily care progress"
                      >
                        <rect
                          x="0"
                          y="0"
                          width="100"
                          height="4"
                          rx="2"
                          fill={isDark ? '#0F172A' : '#E2E8F0'}
                        />
                        <rect
                          x="0"
                          y="0"
                          width={careRatio}
                          height="4"
                          rx="2"
                          fill={accent.fillHex}
                        />
                      </svg>
                    </div>

                    <div className="space-y-2.5">
                      {careItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            setCareItems((prev) =>
                              prev.map((c) =>
                                c.id === item.id ? { ...c, done: !c.done } : c
                              )
                            )
                          }
                          className={`w-full text-left px-4 py-3 border ${subtleBg} ${btnRadius} flex items-center justify-between gap-3 transition-colors cursor-pointer`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                                item.done
                                  ? `${accent.btn} border-transparent`
                                  : isDark
                                    ? 'border-slate-500 bg-slate-800'
                                    : 'border-slate-300 bg-white'
                              }`}
                            >
                              {item.done && <Check className="w-3.5 h-3.5" />}
                            </span>
                            <span
                              className={`${type.body} ${
                                item.done ? `line-through opacity-65 ${textSecondary}` : textPrimary
                              }`}
                            >
                              {item.label}
                            </span>
                          </div>
                          <span className={`${type.caption} ${textSecondary} font-mono tabular-nums shrink-0`}>
                            {item.time}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`lg:col-span-2 border ${cardBg} ${radius} ${pad} flex flex-col justify-between`}>
                    <div>
                      <h4 className={`font-display font-semibold ${type.section} ${textPrimary}`}>
                        Hydration Counter
                      </h4>
                      <p className={`${type.caption} ${textSecondary} mt-1`}>
                        Steady sips throughout the day.
                      </p>

                      <div className="my-5 text-center">
                        <div className={`font-display font-bold text-3xl tabular-nums ${textPrimary}`}>
                          {waterGlasses} / 8 glasses
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setWaterGlasses((g) => Math.min(16, g + 1))}
                          className={`h-[42px] px-3 font-semibold ${type.body} ${btnRadius} ${accent.btn} flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap`}
                        >
                          <Droplets className="w-4 h-4" />
                          +1 Glass
                        </button>
                        <button
                          type="button"
                          onClick={() => setWaterGlasses(0)}
                          className={`h-[42px] px-3 font-medium ${type.body} ${btnRadius} border ${subtleBg} ${textPrimary} cursor-pointer whitespace-nowrap`}
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className={`font-display font-semibold ${type.section} ${textPrimary}`}>
                        How are you feeling?
                      </h4>
                      <textarea
                        rows={3}
                        value={careNote}
                        onChange={(e) => setCareNote(e.target.value)}
                        className={`mt-2 w-full p-3 border ${inputSurface} ${btnRadius} ${type.body} resize-none focus:outline-none`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {config.templateId === 'client-notes' && (
              <div className={`grid grid-cols-1 lg:grid-cols-7 ${gap} items-stretch`}>
                {/* Roster Sidebar Card */}
                <div className={`lg:col-span-2 border ${cardBg} ${radius} ${pad}`}>
                  <h4 className={`font-display font-semibold ${type.section} ${textPrimary}`}>
                    Active Roster
                  </h4>
                  <p className={`${type.caption} ${textSecondary} mt-1`}>
                    Select a person to open their notes.
                  </p>

                  <div className="mt-4 space-y-2.5">
                    {clients.map((client, idx) => {
                      const active = idx === activeClientIdx;
                      return (
                        <button
                          key={client.name}
                          type="button"
                          onClick={() => setActiveClientIdx(idx)}
                          className={`w-full text-left px-3.5 py-3 border ${btnRadius} transition-colors cursor-pointer ${
                            active
                              ? `${softHighlight} ${accent.borderAccent}`
                              : `${subtleBg} hover:opacity-90`
                          }`}
                        >
                          <div className={`font-semibold ${type.body} ${textPrimary}`}>
                            {client.name}
                          </div>
                          <div className={`${type.caption} ${textSecondary} mt-0.5`}>
                            {client.meta}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Editor Card */}
                <div className={`lg:col-span-5 border ${cardBg} ${radius} ${pad} flex flex-col justify-between`}>
                  <div>
                    <h4 className={`font-display font-bold ${type.title} ${textPrimary}`}>
                      {clients[activeClientIdx].name}
                    </h4>
                    <p className={`${type.caption} ${textSecondary} mt-1`}>
                      {clients[activeClientIdx].meta}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setClients((prev) =>
                          prev.map((c, idx) =>
                            idx === activeClientIdx ? { ...c, followup: !c.followup } : c
                          )
                        )
                      }
                      className="mt-4 flex items-center gap-2.5 cursor-pointer"
                    >
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center border ${
                          clients[activeClientIdx].followup
                            ? `${accent.btn} border-transparent`
                            : isDark
                              ? 'border-slate-500 bg-slate-900'
                              : 'border-slate-300 bg-white'
                        }`}
                      >
                        {clients[activeClientIdx].followup && <Check className="w-3.5 h-3.5" />}
                      </span>
                      <span className={`${type.body} ${textSecondary}`}>
                        Flag for gentle follow-up email tomorrow
                      </span>
                    </button>

                    <textarea
                      rows={6}
                      value={clients[activeClientIdx].notes}
                      onChange={(e) => {
                        const val = e.target.value;
                        setClients((prev) =>
                          prev.map((c, idx) =>
                            idx === activeClientIdx ? { ...c, notes: val } : c
                          )
                        );
                      }}
                      className={`mt-4 w-full p-3.5 border ${inputSurface} ${btnRadius} ${type.body} resize-none focus:outline-none`}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <span className={`${type.caption} ${textSecondary}`}>
                      {noteSavedToast
                        ? 'Saved quietly to session record.'
                        : 'All changes stay local on this computer.'}
                    </span>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          setClients((prev) =>
                            prev.map((c, idx) =>
                              idx === activeClientIdx ? { ...c, notes: '' } : c
                            )
                          )
                        }
                        className={`h-[40px] px-4 font-medium ${type.body} ${btnRadius} border ${subtleBg} ${textPrimary} flex items-center gap-1.5 cursor-pointer whitespace-nowrap`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear Draft
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNoteSavedToast(true);
                          window.setTimeout(() => setNoteSavedToast(false), 2000);
                        }}
                        className={`h-[40px] px-5 font-semibold ${type.body} ${btnRadius} ${accent.btn} flex items-center gap-1.5 cursor-pointer whitespace-nowrap`}
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save Note
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {config.templateId === 'calm-budget' && (
              <div className={`flex flex-col ${gap}`}>
                <div className={`border ${cardBg} ${radius} ${pad}`}>
                  <h4 className={`font-display font-bold ${type.section} ${textPrimary}`}>
                    Monthly Breathing Room
                  </h4>
                  <p className={`${type.caption} ${textSecondary} mt-1`}>
                    Adjust sliders below to see your unallocated calm buffer update immediately.
                  </p>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className={`px-4 py-3 border ${subtleBg} ${btnRadius}`}>
                      <div className={`${type.caption} ${textSecondary}`}>Monthly Take-Home</div>
                      <div className={`font-display font-bold text-2xl tabular-nums mt-0.5 ${textPrimary}`}>
                        ${monthlyIncome.toLocaleString()}
                      </div>
                    </div>
                    <div className={`px-4 py-3 border ${subtleBg} ${btnRadius}`}>
                      <div className={`${type.caption} ${textSecondary}`}>Planned Envelopes</div>
                      <div className={`font-display font-bold text-2xl tabular-nums mt-0.5 ${textPrimary}`}>
                        ${plannedTotal.toLocaleString()}
                      </div>
                    </div>
                    <div className={`px-4 py-3 border ${softHighlight} ${accent.borderAccent} ${btnRadius}`}>
                      <div className={`${type.caption} ${textSecondary}`}>Unallocated Buffer</div>
                      <div
                        className={`font-display font-bold text-2xl tabular-nums mt-0.5 ${
                          bufferAmount < 0 ? 'text-rose-500' : accent.textAccent
                        }`}
                      >
                        {bufferAmount < 0 ? `-$${Math.abs(bufferAmount).toLocaleString()}` : `$${bufferAmount.toLocaleString()}`}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`border ${cardBg} ${radius} ${pad}`}>
                  <h4 className={`font-display font-semibold ${type.section} ${textPrimary}`}>
                    Spending Envelopes
                  </h4>
                  <p className={`${type.caption} ${textSecondary} mt-1`}>
                    Drag any slider to rebalance your month gently.
                  </p>

                  <div className="mt-5 space-y-4">
                    {envelopes.map((env, idx) => (
                      <div key={env.name}>
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${type.body} ${textPrimary}`}>
                            {env.name}
                          </span>
                          <span className={`font-mono tabular-nums ${type.body} ${textSecondary}`}>
                            ${env.amount.toLocaleString()}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={2500}
                          step={25}
                          value={env.amount}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setEnvelopes((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, amount: val } : item))
                            );
                          }}
                          className="mt-1.5 w-full accent-blue-600 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setBudgetSaved(true);
                        window.setTimeout(() => setBudgetSaved(false), 1800);
                      }}
                      className={`h-[42px] px-5 font-semibold ${type.body} ${btnRadius} ${accent.btn} cursor-pointer whitespace-nowrap`}
                    >
                      {budgetSaved ? 'Plan Saved' : 'Save Monthly Plan'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empathetic Rationale Note */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">Why this layout works: </span>
          {template.whyEmpathetic}
        </div>
      </div>
    </div>
  );
}
