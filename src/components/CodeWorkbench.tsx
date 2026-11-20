import { useState } from 'react';
import { Check, Copy, Download, Terminal } from 'lucide-react';
import { PythonModule } from '../types/studio';

interface CodeWorkbenchProps {
  modules: PythonModule[];
  onDownloadRunnable: () => void;
}

export function CodeWorkbench({ modules, onDownloadRunnable }: CodeWorkbenchProps) {
  const [activeFileIdx, setActiveFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeModule = modules[activeFileIdx] ?? modules[0];
  const lines = activeModule.code.split('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeModule.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback copy
      const area = document.createElement('textarea');
      area.value = activeModule.code;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleDownloadActive = () => {
    const blob = new Blob([activeModule.code], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeModule.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="python-code" className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {/* Module Selector Header */}
      <div className="px-5 py-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          {modules.map((mod, idx) => (
            <button
              key={mod.filename}
              type="button"
              onClick={() => setActiveFileIdx(idx)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                idx === activeFileIdx
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {mod.filename}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="h-9 px-3.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy File'}
          </button>
          <button
            type="button"
            onClick={handleDownloadActive}
            className="h-9 px-3.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Save {activeModule.filename}
          </button>
          <button
            type="button"
            onClick={onDownloadRunnable}
            className="h-9 px-3.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Full Runnable .py
          </button>
        </div>
      </div>

      {/* File Context Strip */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="text-slate-600">
          <span className="font-semibold text-slate-900">{activeModule.role}:</span>{' '}
          {activeModule.summary}
        </div>
        <div className="flex items-center gap-2 text-slate-500 font-mono tabular-nums">
          <span>{lines.length} lines</span>
          <span aria-hidden="true">·</span>
          <span>Python 3.10+</span>
          <span aria-hidden="true">·</span>
          <span>customtkinter</span>
        </div>
      </div>

      {/* Code Viewport */}
      <div className="bg-slate-950 text-slate-100 overflow-x-auto max-h-[540px] overflow-y-auto">
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

      {/* Quick Run Instructions */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-500 shrink-0" />
          <span>Run locally in two commands:</span>
          <code className="font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-800">
            pip install customtkinter && python {modules[4].filename}
          </code>
        </div>
        <span className="text-slate-500">
          All comments explain layout weights and spacing so anyone can modify them safely.
        </span>
      </div>
    </div>
  );
}
