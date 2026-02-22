'use client';

import { MarketingLayout } from '@/components/marketing/layout';
import { Button } from '@/components/ui/button';
import { Check, Mail } from 'lucide-react';
import Link from 'next/link';

const tiers = [
    {
        name: 'Free Forever',
        price: '₹0',
        description: 'Perfect for individuals managing basic subscriptions.',
        features: [
            'Track up to 20 subscriptions',
            'AI receipt detection',
            'Basic renewal alerts',
            'INR normalization',
        ],
        cta: 'Get Started',
        href: '/register',
        highlight: false,
    },
    {
        name: 'SubZero Pro',
        price: '₹299',
        priceSuffix: '/mo',
        description: 'For power users who want complete financial control.',
        features: [
            'Unlimited subscriptions',
            'Priority AI detection',
            'Predictive burn forecast (12mo)',
            'Advanced financial insights',
            'Priority renewal alerts',
        ],
        cta: 'Coming Soon',
        href: '#',
        highlight: true,
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        description: 'Custom solutions for teams and large organizations.',
        features: [
            'Multi-user workspace',
            'API access',
            'Single sign-on (SSO)',
            'Custom data exports',
            'Dedicated support',
        ],
        cta: 'Contact Sales',
        href: '/contact',
        highlight: false,
    },
];

export default function PricingPage() {
    return (
        <MarketingLayout>
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(217_91%_60%/0.05),transparent_70%)]" />

                <div className="container max-w-6xl">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
                            Simple, <span className="gradient-text-bright">Transparent</span> Pricing
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Choose the plan that fits your needs. Start for free and upgrade as you grow.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {tiers.map((tier) => (
                            <div
                                key={tier.name}
                                className={`flex flex-col p-8 rounded-3xl border ${tier.highlight
                                        ? 'border-blue-500/50 bg-blue-500/[0.03] shadow-[0_0_40px_hsl(217_91%_60%/0.1)] relative overflow-hidden'
                                        : 'border-border/40 bg-card/20'
                                    }`}
                            >
                                {tier.highlight && (
                                    <div className="absolute top-0 right-0 px-4 py-1 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-xl">
                                        Popular
                                    </div>
                                )}
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold mb-2">{tier.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold">{tier.price}</span>
                                        {tier.priceSuffix && <span className="text-muted-foreground">{tier.priceSuffix}</span>}
                                    </div>
                                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed italic">
                                        {tier.description}
                                    </p>
                                </div>

                                <div className="flex-1 space-y-4 mb-8">
                                    {tier.features.map((feature) => (
                                        <div key={feature} className="flex items-start gap-3 text-sm">
                                            <div className="mt-1 h-4 w-4 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                                <Check className="h-2.5 w-2.5 text-blue-400" />
                                            </div>
                                            <span className="text-muted-foreground">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link href={tier.href}>
                                    <Button
                                        className={`w-full rounded-xl py-6 font-semibold transition-all ${tier.highlight
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg'
                                                : 'bg-muted/50 hover:bg-muted text-foreground'
                                            }`}
                                        variant={tier.highlight ? 'default' : 'secondary'}
                                        disabled={tier.cta === 'Coming Soon'}
                                    >
                                        {tier.cta}
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 text-center">
                        <div className="inline-flex items-center gap-6 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
                            <div className="text-left">
                                <p className="font-semibold italic">Ready to see SubZero in action?</p>
                                <p className="text-sm text-muted-foreground">Setup takes less than 60 seconds.</p>
                            </div>
                            <Link href="/register">
                                <Button className="rounded-xl glow-primary">
                                    <Mail className="mr-2 h-4 w-4" />
                                    Sync via Google
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
