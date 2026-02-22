'use client';

import { MarketingLayout } from '@/components/marketing/layout';

export default function PrivacyPage() {
    return (
        <MarketingLayout>
            <section className="py-24">
                <div className="container max-w-3xl">
                    <h1 className="text-4xl font-bold mb-8 italic">Privacy <span className="gradient-text">Policy</span></h1>
                    <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
                        <p className="text-lg">At SubZero, we take your privacy as seriously as your savings. This policy explains how we handle your data.</p>

                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-foreground">1. Data Collection</h2>
                            <p>We collect only the metadata from your Gmail receipts necessary to identify subscriptions: service name, amount, billing cycle, and renewal date. We do not read personal conversations.</p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-foreground">2. Security</h2>
                            <p>Your data is encrypted using industry-standard protocols. We access your Gmail via secure OAuth tokens and nunca (never) store your login credentials.</p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-foreground">3. User Control</h2>
                            <p>You can revoke access to your Gmail or delete your SubZero account at any time. Upon deletion, all your tracked data is permanently removed from our servers.</p>
                        </div>

                        <p className="pt-8 text-sm italic">Last updated: February 22, 2026</p>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
