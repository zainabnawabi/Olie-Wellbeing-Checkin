export type TemplateId =
  | 'focus-breath'
  | 'care-log'
  | 'client-notes'
  | 'calm-budget';

export type AppearanceMode = 'light' | 'dark';

export type AccentPaletteId = 'ocean' | 'sage' | 'indigo' | 'forest';

export type PaddingScale = 16 | 24 | 32;

export type RadiusScale = 10 | 16 | 20;

export type FontScale = 'standard' | 'accessible';

export interface DesignConfig {
  templateId: TemplateId;
  appearanceMode: AppearanceMode;
  accentId: AccentPaletteId;
  cardPadding: PaddingScale;
  cornerRadius: RadiusScale;
  fontScale: FontScale;
}

export interface PaletteTokens {
  id: AccentPaletteId;
  name: string;
  description: string;
  accent: string;
  accentHover: string;
  accentSoftLight: string;
  accentSoftDark: string;
  light: {
    canvas: string;
    card: string;
    cardBorder: string;
    subtleSurface: string;
    textPrimary: string;
    textSecondary: string;
    inputBg: string;
    inputBorder: string;
  };
  dark: {
    canvas: string;
    card: string;
    cardBorder: string;
    subtleSurface: string;
    textPrimary: string;
    textSecondary: string;
    inputBg: string;
    inputBorder: string;
  };
}

export interface TemplateMeta {
  id: TemplateId;
  title: string;
  subtitle: string;
  windowTitle: string;
  windowSize: string;
  audience: string;
  whyEmpathetic: string;
}

export interface PythonModule {
  filename: string;
  role: string;
  summary: string;
  code: string;
}
