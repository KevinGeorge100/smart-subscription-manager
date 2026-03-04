import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Shown by Next.js instantly while the dashboard page JS chunk loads.
 * Mimics the real layout so there's zero layout shift on hydration.
 */
export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-9 w-36" />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="glass border-border/40">
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-28" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-20 mb-1" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left — chart + table */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="glass border-border/40">
                        <CardHeader>
                            <Skeleton className="h-5 w-36" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-52 w-full rounded-lg" />
                        </CardContent>
                    </Card>
                    <Card className="glass border-border/40">
                        <CardContent className="p-6 space-y-3">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-14 w-full rounded-lg" />
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Right sidebar */}
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="glass border-border/40">
                            <CardContent className="p-6 space-y-3">
                                <Skeleton className="h-5 w-28" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-9 w-full rounded-lg" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
