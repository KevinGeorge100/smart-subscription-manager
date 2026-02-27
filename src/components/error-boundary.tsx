'use client';

import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    /** Optional custom fallback UI. Defaults to a styled error card. */
    fallback?: ReactNode;
    /** Short label shown in the fallback card, e.g. "chart" */
    label?: string;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * Catches render/lifecycle errors in a child component tree and
 * shows a friendly fallback instead of crashing the whole page.
 *
 * Usage:
 *   <ErrorBoundary label="chart">
 *     <FinancialPulse ... />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    override componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[SubZero] ErrorBoundary caught an error:', error, info.componentStack);
    }

    override render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            const label = this.props.label ?? 'section';
            return (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border/40 bg-muted/10 p-8 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">
                            Failed to load {label}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Something went wrong. Try refreshing the page.
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
                    >
                        <RefreshCw className="h-3 w-3" />
                        Reload
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
