import { useEffect, useState } from 'react';
import { Check, Download, FolderArchive } from 'lucide-react';
import { DASS21_PYTHON_CODE } from '../data/dass21Data';
import { downloadProjectSourceZip } from '../utils/projectZipExport';

export function ProjectDownloadView() {
  const [status, setStatus] = useState<'idle' | 'downloading' | 'done' | 'error'>('idle');
  const [fileCount, setFileCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDownloadZip = async () => {
    setStatus('downloading');
    setErrorMsg('');
    try {
      const count = await downloadProjectSourceZip();
      setFileCount(count);
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Could not build ZIP file.');
    }
  };

  useEffect(() => {
    void handleDownloadZip();
  }, []);

  const handleDownloadPython = () => {
    const blob = new Blob([DASS21_PYTHON_CODE], {
      type: 'text/x-python;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dass21_app.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen calm-canvas-bg text-[#11131D] flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-lg w-full rounded-[32px] bg-white border border-[#CFD5E6] shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#231073] via-[#4528B8] to-[#5B3EEB] p-7 text-white text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center mx-auto mb-3">
            <FolderArchive className="w-7 h-7 text-[#B8F23B]" />
          </div>
          <h1 className="font-display text-2xl font-bold">
            Download Your Project Files
          </h1>
          <p className="text-sm text-white/90 mt-1.5">
            One clean ZIP ready to unzip and upload straight to GitHub.
          </p>
        </div>

        <div className="p-7 space-y-5">
          {status === 'done' && (
            <div className="rounded-2xl bg-[#D7F7B2] border border-[#82CF38] px-4 py-3 text-sm font-bold text-[#11131D] flex items-center gap-2.5">
              <Check className="w-4 h-4 shrink-0" />
              <span>
                Downloaded {fileCount ?? 'all'} files as{' '}
                <code className="font-mono">olie-wellness-checkin-github.zip</code>
              </span>
            </div>
          )}

          {status === 'error' && (
            <div className="rounded-2xl bg-[#FCD5D5] border border-[#E58A8A] px-4 py-3 text-sm font-bold text-[#8F1212]">
              {errorMsg}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={status === 'downloading'}
              className="w-full h-13 rounded-full bg-[#B8F23B] hover:bg-[#A9E42A] text-[#11131D] text-base font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <FolderArchive className="w-5 h-5" />
              {status === 'downloading'
                ? 'Preparing ZIP...'
                : 'Download Complete Project (.zip)'}
            </button>

            <button
              type="button"
              onClick={handleDownloadPython}
              className="w-full h-11 rounded-full bg-[#EAE6FF] hover:bg-[#DDD5FF] border border-[#C6BCF8] text-[#11131D] text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#4D2EEB]" />
              Download Python App Only (dass21_app.py)
            </button>
          </div>

          <div className="rounded-2xl bg-[#F2F4FB] border border-[#CFD5E6] p-4 text-xs text-[#2B3040] space-y-1.5 leading-relaxed">
            <div className="font-bold text-[#11131D]">Next step for GitHub:</div>
            <p>1. Double click the downloaded ZIP file to unzip it into a folder.</p>
            <p>2. Open your Public repo on GitHub and click uploading an existing file.</p>
            <p>3. Drag everything inside the unzipped folder into GitHub and click Commit changes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
