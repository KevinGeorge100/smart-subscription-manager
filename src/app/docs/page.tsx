'use client';

import { MarketingLayout } from '@/components/marketing/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Mail, Shield, Zap } from 'lucide-react';

const sections = [
    {
        title: 'Getting Started',
        icon: Zap,
        description: 'Learn how to set up your SubZero account in seconds.',
        content: [
            'Create an account using your email.',
            'Connect your Gmail account securely via Google OAuth.',
            'Wait for the AI to scan your receipts (usually takes < 60s).',
            'Review and verify your detected subscriptions.',
        ],
    },
    {
        title: 'AI Detection',
        icon: BrainCircuit,
        description: 'How our intelligent engine finds your subscriptions.',
        content: [
            'We search for keywords like "subscription", "recurring", and "renewal".',
            'The AI parses amounts, dates, and billing cycles from email bodies.',
            'Duplicate detection prevents tracking the same service twice.',
            'Manual overrides allow you to correct any AI misclassifications.',
        ],
    },
    {
        title: 'Security & Privacy',
        icon: Shield,
        description: 'Your data is encrypted and secure with us.',
        content: [
            'We never store your Gmail password.',
            'Data is encrypted at rest and in transit.',
            'We only access the metadata required for subscription tracking.',
            'You can revoke access at any time from your Google Account settings.',
        ],
    },
];

export default function DocsPage() {
    return (
        <MarketingLayout>
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(270_60%_60%/0.03),transparent_70%)]" />

                <div className="container max-w-4xl">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 italic">
                            Knowledge <span className="gradient-text">Base</span>
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Everything you need to know about mastering your subscriptions with SubZero.
                        </p>
                    </div>

                    <div className="space-y-8">
                        {sections.map((section) => (
                            <Card key={section.title} className="glass border-border/40 overflow-hidden">
                                <CardHeader className="flex flex-row items-start gap-4 p-6 bg-muted/5 border-b border-border/20">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <section.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">{section.title}</CardTitle>
                                        <CardDescription className="italic">{section.description}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <ul className="space-y-4">
                                        {section.content.map((item, i) => (
                                            <li key={i} className="flex gap-4 text-sm text-muted-foreground">
                                                <span className="font-bold text-primary italic">0{i + 1}.</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-16 p-8 rounded-2xl border border-border/40 bg-card/20 text-center">
                        <h3 className="font-semibold mb-2">Still have questions?</h3>
                        <p className="text-sm text-muted-foreground mb-6 italics">
                            Our support team is always here to help you optimize your cash flow.
                        </p>
                        <Button size="sm" variant="outline" className="rounded-lg">
                            <Mail className="mr-2 h-4 w-4" />
                            Contact Support
                        </Button>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
