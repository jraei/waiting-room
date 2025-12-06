import { useState } from 'react';
import { GripVertical, Check, Trash2, HelpCircle, Zap, Clock, AlertTriangle } from 'lucide-react';
import { Task, QUADRANT_INFO } from '@/types/task';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface TaskCardProps {
    task: Task;
    onComplete: (id: number) => void;
    onDelete: (id: number) => void;
    isDragging?: boolean;
}

export function TaskCard({ task, onComplete, onDelete, isDragging }: TaskCardProps) {
    const [showReasoning, setShowReasoning] = useState(false);
    const quadrantInfo = QUADRANT_INFO[task.quadrant];
    const isCritical = task.quadrant === 'do' && task.urgency_score >= 80;
    const isHighUrgency = task.urgency_score >= 70;

    return (
        <div
            className={`group relative rounded-xl border transition-all duration-300 ${
                isDragging ? 'opacity-50 scale-105 rotate-2' : ''
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
                <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-quadrant-do text-white text-xs font-bold flex items-center gap-1 shadow-lg z-10">
                    <Zap className="w-3 h-3" />
                    CRITICAL
                </div>
            )}

            <div className="flex items-start gap-3 p-4">
                {/* Drag Handle */}
                <div className="flex-shrink-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Title and Urgency */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className={`font-medium text-sm leading-tight ${
                            task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'
                        }`}>
                            {task.title}
                        </h3>
                        
                        {/* Urgency Score */}
                        <div className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono ${
                            isHighUrgency 
                                ? 'bg-quadrant-do/20 text-quadrant-do' 
                                : 'bg-muted text-muted-foreground'
                        }`}>
                            {isHighUrgency && <AlertTriangle className="w-3 h-3" />}
                            {task.urgency_score}
                        </div>
                    </div>

                    {/* Reasoning Tooltip */}
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button 
                                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                                        onClick={() => setShowReasoning(!showReasoning)}
                                    >
                                        <HelpCircle className="w-3 h-3" />
                                        <span>Why {quadrantInfo.title}?</span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent 
                                    side="bottom" 
                                    className="max-w-[300px] p-3 bg-popover/95 backdrop-blur-sm border-primary/20"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-primary font-medium">
                                            <Zap className="w-4 h-4" />
                                            AI Reasoning
                                        </div>
                                        <p className="text-sm text-popover-foreground/90">
                                            {task.ai_reasoning}
                                        </p>
                                        <div className="pt-2 border-t border-border/50">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                Urgency Score: {task.urgency_score}/100
                                            </div>
                                        </div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* Expanded Reasoning */}
                    {showReasoning && (
                        <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border/30">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {task.ai_reasoning}
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-green-500/20 hover:text-green-500"
                        onClick={() => onComplete(task.id)}
                    >
                        <Check className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-destructive/20 hover:text-destructive"
                        onClick={() => onDelete(task.id)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Bottom border glow effect */}
            <div 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ 
                    background: `linear-gradient(90deg, transparent, ${quadrantInfo.color}, transparent)` 
                }}
            />
        </div>
    );
}
