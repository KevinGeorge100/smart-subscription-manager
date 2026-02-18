'use client';

import { cn } from '@/lib/utils';

export function SubZeroLogo({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 40 40"
            fill="none"
            className={cn('shrink-0', className)}
        >
            <defs>
                <linearGradient
                    id="subzero-gradient"
                    x1="0"
                    y1="0"
                    x2="40"
                    y2="40"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#3B82F6" /> {/* Blue 500 */}
                    <stop offset="1" stopColor="#8B5CF6" /> {/* Violet 500 */}
                </linearGradient>
            </defs>
            <rect width="40" height="40" rx="10" fill="url(#subzero-gradient)" />

            {/* Minimalist 'S' Monogram */}
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M24 13H16C14.3431 13 13 14.3431 13 16V19H23V17H17V16C17 15.4477 17.4477 15 18 15H24V13ZM16 27H24C25.6569 27 27 25.6569 27 24V21H17V23H23V24C23 24.5523 22.5523 25 22 25H16V27Z"
                fill="white"
            />
        </svg>
    );
}
