'use client';
import { Component, ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(_err: unknown) {
    // Log error to monitoring service if desired
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-8 text-red-600">Something went wrong.</div>;
    }
    return this.props.children;
  }
}
