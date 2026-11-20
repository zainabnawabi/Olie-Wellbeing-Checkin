import { useEffect, useState } from 'react';
import { Dass21DesktopWizard } from './components/Dass21DesktopWizard';
import { BreathingModal } from './components/BreathingModal';
import { CalmingFloaters } from './components/CalmingFloaters';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PractitionerPortal } from './components/PractitionerPortal';
import { ProjectDownloadView } from './components/ProjectDownloadView';
import { AmbientSoundType, soundEngine } from './utils/soundEngine';

function checkIsPractitionerRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return (
    window.location.hash === '#practitioner' ||
    params.get('practitioner') === '1' ||
    window.location.pathname === '/practitioner'
  );
}

function checkIsDownloadRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return (
    params.get('download') === 'project' ||
    window.location.hash === '#download-project'
  );
}

export default function App() {
  const [isPractitionerRoute, setIsPractitionerRoute] = useState(checkIsPractitionerRoute);
  const [isDownloadRoute, setIsDownloadRoute] = useState(checkIsDownloadRoute);
  const [answers, setAnswers] = useState<Record<number, 0 | 1 | 2 | 3>>({});
  const [participantName, setParticipantName] = useState('');
  const [participantAge, setParticipantAge] = useState('');
  const [selectedSound, setSelectedSound] = useState<AmbientSoundType>('rain');
  const [ambientVolume, setAmbientVolume] = useState(55);
  const [ambientMuted, setAmbientMuted] = useState(false);
  const [breatherOpen, setBreatherOpen] = useState(false);

  useEffect(() => {
    const syncRoute = () => {
      setIsPractitionerRoute(checkIsPractitionerRoute());
      setIsDownloadRoute(checkIsDownloadRoute());
    };
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('popstate', syncRoute);
    return () => {
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('popstate', syncRoute);
    };
  }, []);

  const handleExitPractitionerPortal = () => {
    const cleanUrl = `${window.location.origin}/`;
    window.history.replaceState(null, '', cleanUrl);
    setIsPractitionerRoute(false);
  };

  const handleVolumeChange = (nextPct: number) => {
    setAmbientVolume(nextPct);
    if (nextPct > 0 && ambientMuted) {
      setAmbientMuted(false);
    }
    soundEngine.setAmbientVolume(nextPct / 100);
  };

  const handleToggleMute = () => {
    soundEngine.playClick(500);
    const nextMuted = !ambientMuted;
    setAmbientMuted(nextMuted);
    soundEngine.setAmbientMuted(nextMuted);
  };

  if (isDownloadRoute) {
    return (
      <ErrorBoundary>
        <ProjectDownloadView />
      </ErrorBoundary>
    );
  }

  if (isPractitionerRoute) {
    return (
      <ErrorBoundary>
        <PractitionerPortal onExitPortal={handleExitPractitionerPortal} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen calm-canvas-bg text-[#11131D] flex flex-col justify-between relative overflow-x-hidden">
        {/* Gentle Slow Bokeh Floaters */}
        <CalmingFloaters />

        {/* Main Check In Workspace */}
        <main className="flex-1 flex items-center justify-center px-3.5 sm:px-6 lg:px-10 py-5 sm:py-8 relative z-10">
          <Dass21DesktopWizard
            answers={answers}
            onAnswersChange={setAnswers}
            participantName={participantName}
            onNameChange={setParticipantName}
            participantAge={participantAge}
            onAgeChange={setParticipantAge}
            selectedSound={selectedSound}
            onSoundChange={setSelectedSound}
            ambientVolume={ambientVolume}
            ambientMuted={ambientMuted}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
            onOpenBreather={() => setBreatherOpen(true)}
          />
        </main>

        {/* Quiet Patient Footer (Zero Practitioner Links, Zero Dashes) */}
        <footer className="px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-center max-w-[1180px] w-full mx-auto text-xs font-medium text-[#2B3040] relative z-10">
          <span>Private Weekly Check In with Olie</span>
        </footer>

        {/* Guided Breathing Pause */}
        <BreathingModal open={breatherOpen} onClose={() => setBreatherOpen(false)} />
      </div>
    </ErrorBoundary>
  );
}
