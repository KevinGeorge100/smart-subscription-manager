'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Info, AlertTriangle, Lightbulb, CalendarClock } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { NotificationType } from '@/types';

const getIcon = (type: NotificationType) => {
    switch (type) {
        case 'renewal': return <CalendarClock className="h-4 w-4 text-blue-400" />;
        case 'saving': return <Lightbulb className="h-4 w-4 text-emerald-400" />;
        case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-400" />;
        default: return <Info className="h-4 w-4 text-slate-400" />;
    }
};

export function NotificationCenter() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-white/10 transition-colors">
                    <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 border-2 border-background text-[10px] font-bold">
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0 glass border-border/40 shadow-2xl" align="end" sideOffset={12}>
                <div className="flex items-center justify-between p-4 border-b border-border/20">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto px-2 py-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                    >
                        Mark all as read
                    </Button>
                </div>

                <ScrollArea className="h-[400px]">
                    {isLoading ? (
                        <div className="p-8 text-center space-y-3">
                            <div className="flex justify-center"><Bell className="h-8 w-8 text-muted/20 animate-pulse" /></div>
                            <p className="text-xs text-muted-foreground">Syncing alerts...</p>
                        </div>
                    ) : notifications && notifications.length > 0 ? (
                        <div className="flex flex-col">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={cn(
                                        "p-4 border-b border-border/10 flex gap-3 transition-colors group relative",
                                        !n.read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-white/5"
                                    )}
                                >
                                    <div className="mt-1 shrink-0">{getIcon(n.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("text-xs font-semibold leading-none mb-1", !n.read ? "text-foreground" : "text-muted-foreground")}>
                                            {n.title}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                            {n.message}
                                        </p>
                                        <p className="text-[10px] text-zinc-500 mt-2">
                                            {mounted && n.createdAt?.toDate ? format(n.createdAt.toDate(), 'MMM d, h:mm a') : 'Just now'}
                                        </p>
                                    </div>
                                    {!n.read && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => markAsRead(n.id)}
                                        >
                                            <Check className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center space-y-3 opacity-60">
                            <div className="flex justify-center"><Check className="h-8 w-8 text-muted-foreground/20" /></div>
                            <p className="text-xs text-muted-foreground italic">No new notifications</p>
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
