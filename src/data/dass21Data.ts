export type DassCategory = 'S' | 'A' | 'D';

export interface DassQuestion {
  no: number;
  level: DassCategory;
  statement: string;
}

export interface ResponseOption {
  score: 0 | 1 | 2 | 3;
  label: string;
}

export type SeverityLevel =
  | 'Normal'
  | 'Mild'
  | 'Moderate'
  | 'Severe'
  | 'Extremely Severe';

export interface ScaleResult {
  category: DassCategory;
  name: 'Depression' | 'Anxiety' | 'Stress';
  rawScore: number;
  finalScore: number;
  severity: SeverityLevel;
  description: string;
}

export const CATEGORY_LABELS: Record<DassCategory, 'Depression' | 'Anxiety' | 'Stress'> = {
  D: 'Depression',
  A: 'Anxiety',
  S: 'Stress',
};

export const FRIENDLY_CATEGORY_LABELS: Record<DassCategory, string> = {
  D: 'Low Mood',
  A: 'Worry & Nerves',
  S: 'Daily Tension',
};

export const CATEGORY_DESCRIPTIONS: Record<DassCategory, string> = {
  D: 'Energy, motivation, and ability to enjoy everyday moments.',
  A: 'Restlessness, physical tension, and sudden feelings of worry.',
  S: 'Difficulty unwinding, irritability, and feeling stretched thin.',
};

export const DASS21_QUESTIONS: DassQuestion[] = [
  { no: 1, level: 'S', statement: 'I found it hard to wind down.' },
  { no: 2, level: 'A', statement: 'I was aware of dryness of my mouth.' },
  { no: 3, level: 'D', statement: "I couldn't seem to experience any positive feeling at all." },
  {
    no: 4,
    level: 'A',
    statement:
      'I experienced breathing difficulty (e.g., excessively rapid breathing, breathlessness in the absence of physical exertion).',
  },
  { no: 5, level: 'D', statement: 'I found it difficult to work up the initiative to do things.' },
  { no: 6, level: 'S', statement: 'I tended to overreact to situations.' },
  { no: 7, level: 'A', statement: 'I experienced trembling (e.g., in the hands).' },
  { no: 8, level: 'S', statement: 'I felt that I was using a lot of nervous energy.' },
  {
    no: 9,
    level: 'A',
    statement:
      'I was worried about situations in which I might panic and make a fool of myself.',
  },
  { no: 10, level: 'D', statement: 'I felt that I had nothing to look forward to.' },
  { no: 11, level: 'S', statement: 'I found myself getting agitated.' },
  { no: 12, level: 'S', statement: 'I found it difficult to relax.' },
  { no: 13, level: 'D', statement: 'I felt downhearted and blue.' },
  {
    no: 14,
    level: 'S',
    statement: 'I was intolerant of anything that kept me from getting on with what I was doing.',
  },
  { no: 15, level: 'A', statement: 'I felt I was close to panic.' },
  { no: 16, level: 'D', statement: 'I was unable to become enthusiastic about anything.' },
  { no: 17, level: 'D', statement: "I felt I wasn't worth much as a person." },
  { no: 18, level: 'S', statement: 'I felt that I was rather touchy.' },
  {
    no: 19,
    level: 'A',
    statement:
      'I was aware of the action of my heart in the absence of physical exertion (e.g., sense of heart rate increase, heart missing a beat).',
  },
  { no: 20, level: 'A', statement: 'I felt scared without any good reason.' },
  { no: 21, level: 'D', statement: 'I felt that life was meaningless.' },
];

export const RESPONSE_OPTIONS: { score: 0 | 1 | 2 | 3; title: string; label: string }[] = [
  { score: 0, title: 'Not at all', label: 'Did not happen this week' },
  { score: 1, title: 'A little bit', label: 'Happened some of the time' },
  { score: 2, title: 'Quite a bit', label: 'Happened a good part of the time' },
  { score: 3, title: 'Almost always', label: 'Happened most of the time' },
];

export const CLINICAL_DISCLAIMER =
  'This check in is a personal reflection tool, not a medical diagnosis. If your week has felt heavy or overwhelming, talking with a doctor, counselor, or someone you trust can be a helpful next step.';

export const SCREENING_NOTICE =
  'Private and unhurried. You can go back and change any answer before seeing your summary.';

export function getGentleStatus(severity: SeverityLevel): string {
  switch (severity) {
    case 'Normal':
      return 'Feeling Steady';
    case 'Mild':
      return 'Light Strain';
    case 'Moderate':
      return 'Noticeable Strain';
    case 'Severe':
      return 'Heavy Strain';
    case 'Extremely Severe':
      return 'Needs Extra Care';
  }
}

export function getSeverity(category: DassCategory, finalScore: number): SeverityLevel {
  if (category === 'D') {
    if (finalScore <= 9) return 'Normal';
    if (finalScore <= 13) return 'Mild';
    if (finalScore <= 20) return 'Moderate';
    if (finalScore <= 27) return 'Severe';
    return 'Extremely Severe';
  }
  if (category === 'A') {
    if (finalScore <= 7) return 'Normal';
    if (finalScore <= 9) return 'Mild';
    if (finalScore <= 14) return 'Moderate';
    if (finalScore <= 19) return 'Severe';
    return 'Extremely Severe';
  }
  if (finalScore <= 14) return 'Normal';
  if (finalScore <= 18) return 'Mild';
  if (finalScore <= 25) return 'Moderate';
  if (finalScore <= 33) return 'Severe';
  return 'Extremely Severe';
}

export function calculateDass21Results(answers: Record<number, number>): ScaleResult[] {
  const rawTotals: Record<DassCategory, number> = { D: 0, A: 0, S: 0 };

  for (const q of DASS21_QUESTIONS) {
    const val = answers[q.no] ?? 0;
    rawTotals[q.level] += val;
  }

  return (['D', 'A', 'S'] as DassCategory[]).map((cat) => {
    const rawScore = rawTotals[cat];
    const finalScore = rawScore * 2;
    return {
      category: cat,
      name: CATEGORY_LABELS[cat],
      rawScore,
      finalScore,
      severity: getSeverity(cat, finalScore),
      description: CATEGORY_DESCRIPTIONS[cat],
    };
  });
}

export { default as DASS21_PYTHON_CODE } from '../../dass21_app.py?raw';
