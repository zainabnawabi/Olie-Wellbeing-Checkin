import { CATEGORY_LABELS, DASS21_QUESTIONS } from '../data/dass21Data';

const CUTOFF_ROWS = [
  { label: 'Normal', d: '0–9', a: '0–7', s: '0–14' },
  { label: 'Mild', d: '10–13', a: '8–9', s: '15–18' },
  { label: 'Moderate', d: '14–20', a: '10–14', s: '19–25' },
  { label: 'Severe', d: '21–27', a: '15–19', s: '26–33' },
  { label: 'Extremely Severe', d: '28+', a: '20+', s: '34+' },
];

export function Dass21ScoringGuide() {
  return (
    <div className="space-y-8">
      {/* Cut-off Reference Table */}
      <section id="scoring-guide" className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Official DASS-21 Scoring Cut-Offs (Multiplied by 2)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Each subscale sums 7 items (0–3 each, raw range 0–21) and multiplies by 2 to produce a final score out of 42.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="px-6 py-3">Severity</th>
                <th className="px-6 py-3">Depression (D)</th>
                <th className="px-6 py-3">Anxiety (A)</th>
                <th className="px-6 py-3">Stress (S)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {CUTOFF_ROWS.map((row) => (
                <tr key={row.label} className="hover:bg-slate-50/70">
                  <td className="px-6 py-3 font-medium text-slate-900">{row.label}</td>
                  <td className="px-6 py-3 font-mono tabular-nums text-slate-700">{row.d}</td>
                  <td className="px-6 py-3 font-mono tabular-nums text-slate-700">{row.a}</td>
                  <td className="px-6 py-3 font-mono tabular-nums text-slate-700">{row.s}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Excel Schema Preview */}
      <section id="excel-dataset" className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Auto-Generated Excel Dataset: dass21_questions.xlsx
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Created automatically by <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">ensure_questions_excel()</code> and read via <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">pandas.read_excel(..., engine=&quot;openpyxl&quot;)</code>.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            21 rows · 3 columns
          </span>
        </div>

        <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
              <tr>
                <th className="px-6 py-3 w-20">No.</th>
                <th className="px-6 py-3 w-40">level</th>
                <th className="px-6 py-3">Statement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DASS21_QUESTIONS.map((q) => (
                <tr key={q.no} className="hover:bg-slate-50/70">
                  <td className="px-6 py-2.5 font-mono tabular-nums text-slate-500">{q.no}</td>
                  <td className="px-6 py-2.5 text-slate-700">
                    <span className="font-mono font-semibold text-[#3D7A6E] mr-1.5">
                      {q.level}
                    </span>
                    <span className="text-xs text-slate-500">({CATEGORY_LABELS[q.level]})</span>
                  </td>
                  <td className="px-6 py-2.5 text-slate-800">{q.statement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
