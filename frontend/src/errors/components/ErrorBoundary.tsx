import React from 'react';

import { ComponentWithChildrenProps } from '../../lib/ui/props';

type ErrorState = {
  error: Error | null;
  info: React.ErrorInfo | null;
};

type ErrorBoundaryProps = ComponentWithChildrenProps & {
  renderFallback?: (params: ErrorState) => React.ReactNode;
};

type ErrorBoundaryState = {
  error: ErrorState | null;
};

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error: { error, info: null } };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ error: { error, info } });
  }

  render() {
    const { children, renderFallback } = this.props;

    if (this.state.error) {
      if (renderFallback) {
        return renderFallback(this.state.error);
      }

      return null;
    }

    return children;
  }
}
