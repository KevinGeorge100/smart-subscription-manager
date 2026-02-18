import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ExternalLink } from 'lucide-react';

export function QuickSyncCard() {
    return (
        <Card className="glass border-border/40">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">Quick Sync</CardTitle>
                <CardDescription>
                    Connect your email to auto-detect subscriptions
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4 rounded-lg border border-dashed border-border/60 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">Gmail</p>
                        <p className="text-xs text-muted-foreground">
                            Scan inbox for subscription receipts
                        </p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                        Connect
                        <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                    OAuth integration coming soon. Your data is encrypted end-to-end.
                </p>
            </CardContent>
        </Card>
    );
}
