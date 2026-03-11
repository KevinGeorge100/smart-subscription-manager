'use client';

import Link from 'next/link';
import { SubZeroLogo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/#features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/docs', label: 'Docs' },
];

export function MarketingHeader() {
  const pathname = usePathname();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="nav-pill rounded-full w-full max-w-3xl"
      >
        <div className="flex h-14 items-center px-4 gap-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <SubZeroLogo className="h-7 w-7" />
            <span className="text-base font-bold tracking-tight">SubZero</span>
          </Link>

          {/* Nav links — centered */}
          <nav className="hidden md:flex items-center gap-1 mx-auto">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/' ? pathname === '/' : pathname.startsWith(link.href.replace('/#', '/'));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-1.5 text-sm rounded-full transition-all duration-200 ${
                    isActive
                      ? 'text-foreground bg-white/[0.07]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[3px] w-[3px] rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTA buttons */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground rounded-full text-sm h-9 px-4"
              >
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 border-0 shadow-[0_0_20px_hsl(217_91%_60%/0.25)] hover:shadow-[0_0_28px_hsl(217_91%_60%/0.4)] transition-all duration-300 h-9 px-4 text-sm font-semibold"
              >
                Get Started
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>
    </div>
  );
}
