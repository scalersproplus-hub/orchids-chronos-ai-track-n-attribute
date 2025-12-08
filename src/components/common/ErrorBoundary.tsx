import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  // FIX: Removed 'public' keyword which may be causing type inference issues.
  state: State = {
    hasError: false
  };

  // FIX: Removed 'public' keyword.
  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  // FIX: Removed 'public' keyword.
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  // FIX: Removed 'public' keyword. This resolves errors related to `this.setState` and `this.props` not being found.
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-chronos-950 text-gray-300">
            <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Something went wrong.</h1>
            <p className="text-gray-500 mb-6">An unexpected error occurred. Please try refreshing the page.</p>
            <button
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 bg-chronos-500 hover:bg-chronos-600 text-white rounded-lg"
            >
                Try again
            </button>
        </div>
      );
    }

    return this.props.children;
  }
}
