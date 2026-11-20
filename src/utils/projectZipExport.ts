import JSZip from 'jszip';

const PROJECT_RAW_FILES = import.meta.glob<string>(
  [
    '/src/**/*.ts',
    '/src/**/*.tsx',
    '/src/**/*.css',
    '/index.html',
    '/package.json',
    '/tsconfig.json',
    '/vite.config.ts',
    '/README.md',
    '/LICENSE',
    '/dass21_app.py',
  ],
  { query: '?raw', import: 'default', eager: false }
);

export async function downloadProjectSourceZip(): Promise<number> {
  const zip = new JSZip();
  let count = 0;
  for (const [rawPath, loader] of Object.entries(PROJECT_RAW_FILES)) {
    const content = await loader();
    zip.file(rawPath.startsWith('/') ? rawPath.slice(1) : rawPath, content);
    count += 1;
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'olie-wellness-checkin-github.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return count;
}
