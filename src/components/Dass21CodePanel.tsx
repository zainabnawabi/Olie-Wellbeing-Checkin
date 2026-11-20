import { useState } from 'react';
import { Check, Copy, Download, Terminal } from 'lucide-react';
import { DASS21_PYTHON_CODE } from '../data/dass21Data';

interface Dass21CodePanelProps {
  onDownloadPython: () => void;
}

export function Dass21CodePanel({ onDownloadPython }: Dass21CodePanelProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPip, setCopiedPip] = useState(false);

  const lines = DASS21_PYTHON_CODE.split('\n');
  const pipCmd = 'pip install customtkinter pandas openpyxl';

  const copyText = async (text: string, setter: (val: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    }
    setter(true);
    window.setTimeout(() => setter(false), 1800);
  };

  return (
    <div id="python-code" className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {/* Header Bar */}
      <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-base font-bold text-slate-900">
            dass21_app.py
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Object-oriented DASS21App(ctk.CTk) with Excel auto-setup, 3-screen wizard, and .txt + .xlsx export
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => copyText(DASS21_PYTHON_CODE, setCopiedCode)}
            className="h-9 px-3.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            {copiedCode ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copiedCode ? 'Copied Script' : 'Copy Code'}
          </button>
          <button
            type="button"
            onClick={onDownloadPython}
            className="h-9 px-4 text-xs font-semibold text-white bg-[#3D7A6E] rounded-lg hover:bg-[#2E5E54] transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download dass21_app.py
          </button>
        </div>
      </div>

      {/* Pip Install Banner */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Terminal className="w-4 h-4 text-[#3D7A6E] shrink-0" />
          <span className="font-medium">Install dependencies:</span>
          <code className="font-mono bg-white border border-slate-200 px-2.5 py-1 rounded text-slate-900">
            {pipCmd}
          </code>
        </div>
        <button
          type="button"
          onClick={() => copyText(pipCmd, setCopiedPip)}
          className="text-xs font-medium text-[#3D7A6E] hover:underline whitespace-nowrap cursor-pointer"
        >
          {copiedPip ? 'Copied pip command' : 'Copy pip command'}
        </button>
      </div>

      {/* Python Source Code Viewport */}
      <div className="bg-slate-950 text-slate-100 overflow-x-auto max-h-[560px] overflow-y-auto">
        <table className="w-full border-collapse font-mono text-[13px] leading-relaxed">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-slate-900/70">
                <td className="select-none text-right pr-4 pl-5 py-0.5 text-slate-600 tabular-nums w-12 align-top">
                  {idx + 1}
                </td>
                <td className="pr-6 py-0.5 whitespace-pre text-slate-100">{line || ' '}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
