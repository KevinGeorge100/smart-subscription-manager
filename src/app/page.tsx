import { ArrowRight, BellRing, LayoutList, PieChart, ShieldCheck, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const heroImage = PlaceHolderImages.find(img => img.id === 'hero-landing');

export default function Home() {
  const features = [
    {
      icon: <LayoutList className="h-8 w-8 text-primary" />,
      title: "Centralized Dashboard",
      description: "See all your subscriptions in one place. No more hunting through bank statements.",
    },
    {
      icon: <PieChart className="h-8 w-8 text-primary" />,
      title: "Spending Insights",
      description: "Understand where your money is going with easy-to-read charts and summaries.",
    },
    {
      icon: <BellRing className="h-8 w-8 text-primary" />,
      title: "Upcoming Renewal Alerts",
      description: "Get notified before a subscription renews, so you can decide to keep or cancel it.",
    },
    {
      icon: <Wallet className="h-8 w-8 text-primary" />,
      title: "Better Financial Awareness",
      description: "Gain a clear picture of your monthly and annual commitments to take control of your finances.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="font-bold sm:inline-block">
                Subscription Clarity
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
              Take Control of Your Subscriptions
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Track, manage, and optimize your recurring payments, so you never overspend again.
            </p>
            <div className="space-x-4 mt-4">
              <Link href="/register">
                <Button size="lg">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Hero Image */}
        <section className="container">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border bg-card shadow-lg">
             <div className="absolute top-4 left-4 flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                width={1200}
                height={800}
                className="w-full pt-10"
                data-ai-hint={heroImage.imageHint}
              />
            )}
          </div>
        </section>
        
        {/* Problem Section */}
        <section id="problem" className="py-20 md:py-24 lg:py-32 bg-muted/50">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">
                The Hidden Costs of Convenience
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                We've all been there. A free trial becomes a paid subscription. A service you no longer use keeps charging your card. It's time to put an end to subscription chaos.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center p-4">
                <h3 className="mb-2 text-2xl font-bold text-primary">71%</h3>
                <p className="text-muted-foreground">
                 of people waste over $50 a month on unwanted subscriptions.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <h3 className="mb-2 text-2xl font-bold text-primary">42%</h3>
                <p className="text-muted-foreground">
                  find it difficult to track all their recurring payments across different services.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <h3 className="mb-2 text-2xl font-bold text-primary">85%</h3>
                <p className="text-muted-foreground">
                  of consumers wish they had a single place to manage all their subscriptions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features/Benefits Section */}
        <section id="features" className="container space-y-6 py-20 md:py-24 lg:py-32">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
              Everything You Need for Financial Peace of Mind
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Our features are designed to give you a clear view of your financial commitments.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-6 sm:grid-cols-2 md:max-w-[64rem] pt-12">
            {features.map((feature) => (
              <Card key={feature.title} className="flex flex-col justify-between p-4 transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-center gap-4 p-2">
                  <div className="bg-secondary p-3 rounded-lg">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        {/* Final CTA Section */}
        <section id="cta" className="bg-primary/5 py-20">
          <div className="container flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Ready to Declutter Your Digital Wallet?
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Start tracking your subscriptions in minutes. It's free to get started and brings immediate clarity to your spending.
            </p>
            <div className="mt-8">
              <Link href="/register">
                <Button size="lg">
                  Sign Up Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            &copy; {new Date().getFullYear()} Subscription Clarity. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
