import { LayoutGrid, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Task } from '@/types/task';

interface MatrixHeaderProps {
    tasks: Task[];
}

export function MatrixHeader({ tasks }: MatrixHeaderProps) {
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const criticalTasks = pendingTasks.filter(t => t.quadrant === 'do' && t.urgency_score >= 80);
    const avgUrgency = pendingTasks.length > 0 
        ? Math.round(pendingTasks.reduce((acc, t) => acc + t.urgency_score, 0) / pendingTasks.length)
        : 0;

    return (
        <div className="relative w-full">
            {/* Background glow */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/5 via-accent/5 to-neon-magenta/5 blur-3xl" />
            
            <div className="relative glass dark:glass rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Logo & Title */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent blur-lg opacity-50" />
                            <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary to-accent">
                                <LayoutGrid className="w-8 h-8 text-primary-foreground" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight gradient-text">
                                Eisenhower Matrix
                            </h1>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-accent" />
                                AI-Powered Task Intelligence
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex-1 flex flex-wrap gap-3 md:justify-end">
                        {/* Critical Tasks */}
                        {criticalTasks.length > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-quadrant-do/10 border border-quadrant-do/30 animate-pulse-critical">
                                <div className="w-2 h-2 rounded-full bg-quadrant-do animate-ping" />
                                <span className="text-sm font-bold text-quadrant-do">
                                    {criticalTasks.length} Critical
                                </span>
                            </div>
                        )}

                        {/* Pending */}
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border/50">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <span className="text-sm">
                                <span className="font-bold text-foreground">{pendingTasks.length}</span>
                                <span className="text-muted-foreground ml-1">Pending</span>
                            </span>
                        </div>

                        {/* Completed */}
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border/50">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-sm">
                                <span className="font-bold text-foreground">{completedTasks.length}</span>
                                <span className="text-muted-foreground ml-1">Done</span>
                            </span>
                        </div>

                        {/* Avg Urgency */}
                        {pendingTasks.length > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border/50">
                                <div 
                                    className={`w-3 h-3 rounded-full ${
                                        avgUrgency >= 70 ? 'bg-quadrant-do' : 
                                        avgUrgency >= 40 ? 'bg-quadrant-decide' : 
                                        'bg-quadrant-delegate'
                                    }`}
                                />
                                <span className="text-sm">
                                    <span className="font-bold text-foreground">{avgUrgency}</span>
                                    <span className="text-muted-foreground ml-1">Avg Urgency</span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
