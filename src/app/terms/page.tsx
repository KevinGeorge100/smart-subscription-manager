'use client';

import { MarketingLayout } from '@/components/marketing/layout';

export default function TermsPage() {
    return (
        <MarketingLayout>
            <section className="py-24">
                <div className="container max-w-3xl">
                    <h1 className="text-4xl font-bold mb-8 italic">Terms of <span className="gradient-text">Service</span></h1>
                    <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
                        <p className="text-lg">By using SubZero, you agree to these legal terms. Please read them carefully.</p>

                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-foreground">1. Use of Service</h2>
                            <p>SubZero is provided for personal, non-commercial use to assist in tracking and managing digital subscriptions. You are responsible for maintaining the security of your account.</p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-foreground">2. AI Detection Disclaimer</h2>
                            <p>Our AI detection is highly accurate but not infallible. Users should always verify detected subscriptions to ensure absolute financial accuracy.</p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-foreground">3. Limitation of Liability</h2>
                            <p>SubZero is not responsible for any missed payments, duplicate charges, or financial losses associated with the use of our platform.</p>
                        </div>

                        <p className="pt-8 text-sm italic">Last updated: February 22, 2026</p>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
