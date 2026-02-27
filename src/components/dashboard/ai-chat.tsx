'use client';

/**
 * AIChat — "Ask SubZero" floating chat bubble
 *
 * A fixed bottom-right chat interface that expands into a glassmorphic window.
 * Uses Framer Motion for open/close animations and a word-by-word typing effect.
 * Integrates with POST /api/chat (secured by Firebase ID token).
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Bot } from 'lucide-react';
import { useUser, useFirebase } from '@/firebase';
import { getIdToken } from 'firebase/auth';
import { cn } from '@/lib/utils';
import { SubZeroLogo } from '@/components/ui/logo';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    displayContent: string; // Animated subset, fills up word-by-word
    referencedSubs?: string[];
    isTyping?: boolean;
}

// ── Starter Suggestions ───────────────────────────────────────────────────────

const STARTER_PROMPTS = [
    'How much am I spending monthly?',
    'Which subscriptions should I cancel?',
    "What's my most expensive category?",
];

// ── Word-by-word typing hook ──────────────────────────────────────────────────

function useTypingEffect(text: string, speed: number = 22) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!text) return;
        setDisplayed('');
        setDone(false);

        const words = text.split(' ');
        let idx = 0;

        const interval = setInterval(() => {
            idx++;
            setDisplayed(words.slice(0, idx).join(' '));
            if (idx >= words.length) {
                clearInterval(interval);
                setDone(true);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed]);

    return { displayed, done };
}

// ── Typing Dots ───────────────────────────────────────────────────────────────

function TypingDots() {
    return (
        <div className="flex items-center gap-1 px-1 py-0.5">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-primary/70"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
                />
            ))}
        </div>
    );
}

// ── Single Message Bubble ─────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
    const isUser = message.role === 'user';
    const { displayed } = useTypingEffect(
        !isUser && !message.isTyping ? message.content : '',
        22
    );

    const text = isUser || message.isTyping ? message.content : displayed;

    return (
        <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
            <div className={cn('flex max-w-[85%] flex-col gap-1.5', isUser && 'items-end')}>
                {/* Bubble */}
                <div
                    className={cn(
                        'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                        isUser
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-white/8 border border-white/10 text-foreground rounded-bl-sm backdrop-blur-sm'
                    )}
                >
                    {message.isTyping ? <TypingDots /> : text || <TypingDots />}
                </div>

                {/* Referenced subscription chips */}
                {!isUser && !message.isTyping && message.referencedSubs && message.referencedSubs.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {message.referencedSubs.map((sub) => (
                            <span
                                key={sub}
                                className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                            >
                                <Sparkles className="h-2.5 w-2.5" />
                                {sub}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main Chat Component ───────────────────────────────────────────────────────

export function AIChat() {
    const { user } = useUser();
    const { auth } = useFirebase();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [open]);

    const sendMessage = useCallback(
        async (text: string) => {
            const query = text.trim();
            if (!query || isLoading || !user || !auth) return;

            setInput('');
            setIsLoading(true);

            const userMsg: Message = {
                id: crypto.randomUUID(),
                role: 'user',
                content: query,
                displayContent: query,
            };
            const typingMsg: Message = {
                id: 'typing',
                role: 'assistant',
                content: '',
                displayContent: '',
                isTyping: true,
            };

            setMessages((prev) => [...prev, userMsg, typingMsg]);

            try {
                const idToken = await getIdToken(user);
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({ query }),
                });

                const data = await res.json();
                const answer: string =
                    data.answer ?? "Sorry, I couldn't process that. Please try again.";
                const referencedSubs: string[] = data.referencedSubs ?? [];

                setMessages((prev) => {
                    const filtered = prev.filter((m) => m.id !== 'typing');
                    return [
                        ...filtered,
                        {
                            id: crypto.randomUUID(),
                            role: 'assistant',
                            content: answer,
                            displayContent: answer,
                            referencedSubs,
                        },
                    ];
                });
            } catch {
                setMessages((prev) => {
                    const filtered = prev.filter((m) => m.id !== 'typing');
                    return [
                        ...filtered,
                        {
                            id: crypto.randomUUID(),
                            role: 'assistant',
                            content: "I'm having trouble connecting right now. Please try again.",
                            displayContent: '',
                            referencedSubs: [],
                        },
                    ];
                });
            } finally {
                setIsLoading(false);
            }
        },
        [isLoading, user, auth]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    return (
        <>
            {/* ── Chat Window ── */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl shadow-2xl"
                        style={{
                            background: 'rgba(15, 15, 25, 0.75)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            border: '1px solid rgba(255,255,255,0.09)',
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                                <Bot className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold leading-none">SubZero AI</p>
                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                    Your financial advisor
                                </p>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/8 hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 scrollbar-none">
                            {messages.length === 0 ? (
                                /* Empty state — starter prompts */
                                <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
                                            <SubZeroLogo className="h-7 w-7" />
                                        </div>
                                        <p className="text-sm font-medium">Ask me anything</p>
                                        <p className="text-xs text-muted-foreground">
                                            I know your subscriptions inside-out.
                                        </p>
                                    </div>
                                    <div className="flex w-full flex-col gap-2">
                                        {STARTER_PROMPTS.map((prompt) => (
                                            <button
                                                key={prompt}
                                                onClick={() => sendMessage(prompt)}
                                                className="w-full rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-left text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/8 hover:text-foreground"
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <MessageBubble key={msg.id} message={msg} />
                                ))
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input Bar */}
                        <div className="border-t border-white/8 p-3">
                            <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask SubZero..."
                                    rows={1}
                                    disabled={isLoading}
                                    className="max-h-24 flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-50"
                                    style={{ lineHeight: '1.5' }}
                                />
                                <button
                                    onClick={() => sendMessage(input)}
                                    disabled={!input.trim() || isLoading}
                                    className={cn(
                                        'mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all',
                                        input.trim() && !isLoading
                                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                            : 'bg-white/8 text-muted-foreground'
                                    )}
                                >
                                    <Send className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            <p className="mt-1.5 text-center text-[10px] text-muted-foreground/40">
                                Powered by Gemini · Enter to send
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Floating Bubble ── */}
            <motion.button
                onClick={() => setOpen((v) => !v)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 focus:outline-none"
            >
                {/* Pulse ring */}
                {!open && (
                    <motion.span
                        className="absolute inset-0 rounded-full bg-primary"
                        animate={{ scale: [1, 1.35, 1.35], opacity: [0.5, 0, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                    />
                )}
                <AnimatePresence mode="wait">
                    {open ? (
                        <motion.span
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <X className="h-6 w-6 text-primary-foreground" />
                        </motion.span>
                    ) : (
                        <motion.span
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <SubZeroLogo className="h-7 w-7 text-primary-foreground" />
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>
        </>
    );
}
