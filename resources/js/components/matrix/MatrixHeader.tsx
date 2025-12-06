import { Task } from '@/types/task';
import { CheckCircle2, LayoutGrid, Sparkles, TrendingUp } from 'lucide-react';

interface MatrixHeaderProps {
    tasks: Task[];
}

export function MatrixHeader({ tasks }: MatrixHeaderProps) {
    const pendingTasks = tasks.filter((t) => t.status === 'pending');
    const completedTasks = tasks.filter((t) => t.status === 'completed');
    const criticalTasks = pendingTasks.filter(
        (t) => t.quadrant === 'do' && t.urgency_score >= 80,
    );
    const avgUrgency =
        pendingTasks.length > 0
            ? Math.round(
                  pendingTasks.reduce((acc, t) => acc + t.urgency_score, 0) /
                      pendingTasks.length,
              )
            : 0;

    return (
        <div className="relative w-full">
            {/* Background glow */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/5 via-accent/5 to-neon-magenta/5 blur-3xl" />

            <div className="glass dark:glass relative rounded-2xl p-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-center">
                    {/* Logo & Title */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent opacity-50 blur-lg" />
                            <div className="relative rounded-2xl bg-gradient-to-br from-primary to-accent p-3">
                                <LayoutGrid className="h-8 w-8 text-primary-foreground" />
                            </div>
                        </div>
                        <div>
                            <h1 className="gradient-text text-2xl font-bold tracking-tight md:text-3xl">
                                Eisenhower Matrix
                            </h1>
                            <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Sparkles className="h-3 w-3 text-accent" />
                                Smart Task Classifier
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-1 flex-wrap gap-3 md:justify-end">
                        {/* Critical Tasks */}
                        {criticalTasks.length > 0 && (
                            <div className="animate-pulse-critical flex items-center gap-2 rounded-xl border border-quadrant-do/30 bg-quadrant-do/10 px-4 py-2">
                                <div className="h-2 w-2 animate-ping rounded-full bg-quadrant-do" />
                                <span className="text-sm font-bold text-quadrant-do">
                                    {criticalTasks.length} Urgent
                                </span>
                            </div>
                        )}

                        {/* Pending */}
                        <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/50 px-4 py-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <span className="text-sm">
                                <span className="font-bold text-foreground">
                                    {pendingTasks.length}
                                </span>
                                <span className="ml-1 text-muted-foreground">
                                    Pending
                                </span>
                            </span>
                        </div>

                        {/* Completed */}
                        <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/50 px-4 py-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm">
                                <span className="font-bold text-foreground">
                                    {completedTasks.length}
                                </span>
                                <span className="ml-1 text-muted-foreground">
                                    Done
                                </span>
                            </span>
                        </div>

                        {/* Avg Urgency */}
                        {pendingTasks.length > 0 && (
                            <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/50 px-4 py-2">
                                <div
                                    className={`h-3 w-3 rounded-full ${
                                        avgUrgency >= 70
                                            ? 'bg-quadrant-do'
                                            : avgUrgency >= 40
                                              ? 'bg-quadrant-decide'
                                              : 'bg-quadrant-delegate'
                                    }`}
                                />
                                <span className="text-sm">
                                    <span className="font-bold text-foreground">
                                        {avgUrgency}
                                    </span>
                                    <span className="ml-1 text-muted-foreground">
                                        Avg Urgency
                                    </span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
