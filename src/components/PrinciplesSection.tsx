import { DesignConfig } from '../types/studio';

interface PrinciplesSectionProps {
  config: DesignConfig;
}

export function PrinciplesSection({ config }: PrinciplesSectionProps) {
  const outerMargin = config.cardPadding + 8;

  const principles = [
    {
      index: '01.',
      title: 'Clean Card Architecture',
      description:
        'Group related widgets inside a single CardFrame (CTkFrame with corner_radius and a 1px border) instead of scattering floating inputs across a raw grey window.',
      rule: `corner_radius = ${config.cornerRadius}px · border_width = 1px`,
    },
    {
      index: '02.',
      title: 'Generous Breathing Room',
      description:
        'Always give outer window margins more space than inner card padding. Whitespace is the simplest way to make a desktop tool feel calm rather than overwhelming.',
      rule: `window_margin = ${outerMargin}px · card_pad = ${config.cardPadding}px`,
    },
    {
      index: '03.',
      title: 'Clear Visual Hierarchy',
      description:
        'Every section leads with a bold SectionHeader title and quiet helper text underneath, pairing 60% neutral canvas, 30% card surface, and 10% primary accent.',
      rule: `title = ${config.fontScale === 'accessible' ? '26px' : '22px'} · body = ${config.fontScale === 'accessible' ? '15px' : '14px'}`,
    },
    {
      index: '04.',
      title: 'Modular, Explainable Code',
      description:
        'Separating theme.py, components.py, and app_window.py lets any teammate or beginner inspect colors, swap a card layout, or explain the structure in two minutes.',
      rule: '4 modular files + 1 single-file export',
    },
  ];

  return (
    <section id="architecture" className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-900">
          Design Principles Applied to Every Export
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          How the generated CustomTkinter modules replace cramped default Tkinter habits with calm, readable desktop software.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {principles.map((item) => (
          <div
            key={item.index}
            className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between gap-4"
          >
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900">
                <span className="text-slate-400 mr-2 font-mono">{item.index}</span>
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {item.description}
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-xs font-mono text-slate-500 tabular-nums">
              {item.rule}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
