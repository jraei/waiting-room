import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { QUADRANT_INFO, Task } from '@/types/task';
import {
    AlertTriangle,
    Check,
    Clock,
    GripVertical,
    HelpCircle,
    Trash2,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

interface TaskCardProps {
    task: Task;
    onComplete: (id: number) => void;
    onDelete: (id: number) => void;
    isDragging?: boolean;
}

export function TaskCard({
    task,
    onComplete,
    onDelete,
    isDragging,
}: TaskCardProps) {
    const [showReasoning, setShowReasoning] = useState(false);
    const quadrantInfo = QUADRANT_INFO[task.quadrant];
    const isCritical = task.quadrant === 'do' && task.urgency_score >= 80;
    const isHighUrgency = task.urgency_score >= 70;

    return (
        <div
            className={`group relative rounded-xl border transition-all duration-300 ${
                isDragging ? 'scale-105 rotate-2 opacity-50' : ''
            } ${
                isCritical
                    ? 'animate-pulse-critical border-quadrant-do bg-quadrant-do/5'
                    : 'border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card/80'
            }`}
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData('taskId', task.id.toString());
                e.dataTransfer.effectAllowed = 'move';
            }}
        >
            {/* Critical Badge */}
            {isCritical && (
                <div className="absolute -top-2 -right-2 z-10 flex items-center gap-1 rounded-full bg-quadrant-do px-2 py-0.5 text-xs font-bold text-white shadow-lg">
                    <Zap className="h-3 w-3" />
                    URGENT
                </div>
            )}

            <div className="flex items-start gap-3 p-4">
                {/* Drag Handle */}
                <div className="flex-shrink-0 cursor-grab opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* Main Content */}
                <div className="min-w-0 flex-1">
                    {/* Title and Urgency */}
                    <div className="mb-2 flex items-start justify-between gap-2">
                        <h3
                            className={`text-sm leading-tight font-medium ${
                                task.status === 'completed'
                                    ? 'text-muted-foreground line-through'
                                    : 'text-foreground'
                            }`}
                        >
                            {task.title}
                        </h3>

                        {/* Urgency Score */}
                        <div
                            className={`flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs ${
                                isHighUrgency
                                    ? 'bg-quadrant-do/20 text-quadrant-do'
                                    : 'bg-muted text-muted-foreground'
                            }`}
                        >
                            {isHighUrgency && (
                                <AlertTriangle className="h-3 w-3" />
                            )}
                            {task.urgency_score}
                        </div>
                    </div>

                    {/* Reasoning Tooltip */}
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
                                        onClick={() =>
                                            setShowReasoning(!showReasoning)
                                        }
                                    >
                                        <HelpCircle className="h-3 w-3" />
                                        <span>Why {quadrantInfo.title}?</span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="bottom"
                                    className="max-w-[300px] border-primary/20 bg-popover/95 p-3 backdrop-blur-sm"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 font-medium text-primary">
                                            <Zap className="h-4 w-4" />
                                            AI Reasoning
                                        </div>
                                        <p className="text-sm text-popover-foreground/90">
                                            {task.ai_reasoning}
                                        </p>
                                        <div className="border-t border-border/50 pt-2">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                Urgency Score:{' '}
                                                {task.urgency_score}/100
                                            </div>
                                        </div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* Expanded Reasoning */}
                    {showReasoning && (
                        <div className="mt-3 rounded-lg border border-border/30 bg-muted/50 p-3">
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                {task.ai_reasoning}
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-shrink-0 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-green-500/20 hover:text-green-500"
                        onClick={() => onComplete(task.id)}
                    >
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-destructive/20 hover:text-destructive"
                        onClick={() => onDelete(task.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Bottom border glow effect */}
            <div
                className="absolute bottom-0 left-1/2 h-px w-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                    background: `linear-gradient(90deg, transparent, ${quadrantInfo.color}, transparent)`,
                }}
            />
        </div>
    );
}
