'use client';

import { MarketingLayout } from '@/components/marketing/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageCircle } from 'lucide-react';

export default function ContactPage() {
    return (
        <MarketingLayout>
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,hsl(185_70%_50%/0.03),transparent_70%)]" />

                <div className="container max-w-4xl">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                            Let&apos;s <span className="gradient-text-bright">Connect</span>
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Have a question, feedback, or need help optimizing your subscriptions? We&apos;re all ears.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        <Card className="glass border-border/40">
                            <CardHeader>
                                <CardTitle>Send us a message</CardTitle>
                                <CardDescription>We typically respond within 24 hours.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" placeholder="Alex Johnson" className="bg-muted/10" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="alex@example.com" className="bg-muted/10" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea id="message" placeholder="How can we help?" className="min-h-[120px] bg-muted/10" />
                                </div>
                                <Button className="w-full rounded-xl glow-primary">Send Message</Button>
                            </CardContent>
                        </Card>

                        <div className="space-y-6 pt-6">
                            <div className="p-6 rounded-2xl border border-border/40 bg-card/20 group hover:border-blue-500/20 transition-colors">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                        <Mail className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <h3 className="font-semibold">Email Support</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">Detailed inquiries or partnership requests.</p>
                                <p className="mt-2 font-medium text-primary">support@subzero.in</p>
                            </div>

                            <div className="p-6 rounded-2xl border border-border/40 bg-card/20 group hover:border-purple-500/20 transition-colors">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                                        <MessageCircle className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <h3 className="font-semibold">Discord Community</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">Join our community for quick tips and chat.</p>
                                <p className="mt-2 font-medium text-primary cursor-pointer hover:underline italic">Join the Discord server →</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
