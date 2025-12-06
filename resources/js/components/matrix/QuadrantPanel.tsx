import { Quadrant, QUADRANT_INFO, Task } from '@/types/task';
import { Calendar, Trash2, Users, Zap } from 'lucide-react';
import { useState } from 'react';
import { TaskCard } from './TaskCard';

interface QuadrantPanelProps {
    quadrant: Quadrant;
    tasks: Task[];
    onTaskComplete: (id: number) => void;
    onTaskDelete: (id: number) => void;
    onTaskDrop: (taskId: number, quadrant: Quadrant) => void;
}

const iconMap = {
    do: Zap,
    decide: Calendar,
    delegate: Users,
    delete: Trash2,
};

export function QuadrantPanel({
    quadrant,
    tasks,
    onTaskComplete,
    onTaskDelete,
    onTaskDrop,
}: QuadrantPanelProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const info = QUADRANT_INFO[quadrant];
    const Icon = iconMap[quadrant];

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const taskId = parseInt(e.dataTransfer.getData('taskId'), 10);
        if (!isNaN(taskId)) {
            onTaskDrop(taskId, quadrant);
        }
    };

    return (
        <div
            className={`relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border transition-all duration-300 ${
                isDragOver
                    ? `border-2 border-dashed ${info.borderClass} ${info.bgClass}`
                    : 'border-border/30 bg-card/30'
            } ${quadrant === 'do' ? 'dark:shadow-[0_0_30px_rgba(255,77,77,0.1)]' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Header */}
            <div
                className={`relative flex items-center gap-3 border-b border-border/30 p-4 ${
                    quadrant === 'do' ? 'bg-quadrant-do/5' : ''
                }`}
            >
                {/* Glow effect for DO quadrant */}
                {quadrant === 'do' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-quadrant-do/10 via-transparent to-transparent" />
                )}

                <div
                    className={`relative rounded-xl p-2.5 ${info.bgClass}`}
                    style={{
                        boxShadow:
                            quadrant === 'do'
                                ? '0 0 20px rgba(255,77,77,0.3)'
                                : undefined,
                    }}
                >
                    <Icon className="h-5 w-5" style={{ color: info.color }} />
                </div>
                <div className="relative flex-1">
                    <div className="flex items-center gap-2">
                        <h3
                            className="text-lg font-bold tracking-wide"
                            style={{ color: info.color }}
                        >
                            {info.title}
                        </h3>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            {tasks.length}
                        </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {info.subtitle}
                    </p>
                </div>
            </div>

            {/* Tasks Container */}
            <div className="flex-1 space-y-2 overflow-y-auto p-3">
                {tasks.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                        <div
                            className={`rounded-full p-4 ${info.bgClass} mb-3 opacity-50`}
                        >
                            <Icon
                                className="h-8 w-8"
                                style={{ color: info.color }}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {info.description}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/50">
                            Drag tasks here or add new ones
                        </p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onComplete={onTaskComplete}
                            onDelete={onTaskDelete}
                        />
                    ))
                )}
            </div>

            {/* Drop indicator */}
            {isDragOver && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/50 backdrop-blur-sm">
                    <div
                        className="flex items-center gap-2 text-lg font-bold"
                        style={{ color: info.color }}
                    >
                        <Icon className="h-6 w-6" />
                        Drop to {info.title}
                    </div>
                </div>
            )}
        </div>
    );
}
