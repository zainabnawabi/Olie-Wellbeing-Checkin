import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || 'Something went wrong.' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen calm-canvas-bg flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-[28px] bg-white border border-[#CFD5E6] p-8 shadow-xl text-center space-y-4">
            <h2 className="font-display text-2xl font-bold text-[#11131D]">
              Pause and Refresh
            </h2>
            <p className="text-sm text-[#2B3040] leading-relaxed">
              Something unexpected happened while loading this screen. Refreshing will bring you right back.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="h-11 px-6 rounded-full bg-[#4D2EEB] hover:bg-[#3E22CE] text-white text-sm font-bold cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
