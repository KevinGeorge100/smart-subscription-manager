'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skull, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AIInsight } from '@/types';
import { Badge } from '@/components/ui/badge';

interface KillListCardProps {
    insights: AIInsight[];
    isLoading?: boolean;
}

export function KillListCard({ insights, isLoading }: KillListCardProps) {
    const killSuggestions = insights.filter(i => i.type === 'kill');

    if (isLoading) {
        return (
            <Card className="glass border-border/40 animate-pulse bg-muted/20 h-[300px]" />
        );
    }

    if (killSuggestions.length === 0) {
        return (
            <Card className="glass border-border/40 border-emerald-500/20 bg-emerald-500/5">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <CardTitle className="text-lg font-semibold text-emerald-400">Kill List Empty</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Your subscriptions are lean and optimized. No redundant or overlapping services detected.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="glass border-border/40 border-red-500/20 bg-red-500/5">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <Skull className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-semibold text-red-400">The Kill List</CardTitle>
                            <CardDescription className="text-red-400/60">AI suggestions to cut the fat</CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/5">
                        {killSuggestions.length} Target{killSuggestions.length > 1 ? 's' : ''}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {killSuggestions.map((suggestion, idx) => (
                    <div
                        key={idx}
                        className="p-3 rounded-lg border border-red-500/10 bg-black/20 space-y-2 group hover:border-red-500/30 transition-colors"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold">{suggestion.title}</p>
                            <AlertTriangle className="h-4 w-4 text-orange-400 flex-shrink-0" />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {suggestion.summary}
                        </p>
                        <div className="flex items-center text-[10px] text-red-400 font-medium">
                            <span>REDUNDANCY DETECTED</span>
                            <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
