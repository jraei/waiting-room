import { useState } from 'react';
import { Zap, Calendar, Users, Trash2 } from 'lucide-react';
import { Task, Quadrant, QUADRANT_INFO } from '@/types/task';
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
    onTaskDrop 
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
            className={`relative flex flex-col h-full min-h-[300px] rounded-2xl border transition-all duration-300 overflow-hidden ${
                isDragOver 
                    ? `border-2 border-dashed ${info.borderClass} ${info.bgClass}` 
                    : 'border-border/30 bg-card/30'
            } ${quadrant === 'do' ? 'dark:shadow-[0_0_30px_rgba(255,77,77,0.1)]' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Header */}
            <div className={`relative flex items-center gap-3 p-4 border-b border-border/30 ${
                quadrant === 'do' ? 'bg-quadrant-do/5' : ''
            }`}>
                {/* Glow effect for DO quadrant */}
                {quadrant === 'do' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-quadrant-do/10 via-transparent to-transparent" />
                )}
                
                <div 
                    className={`relative p-2.5 rounded-xl ${info.bgClass}`}
                    style={{ 
                        boxShadow: quadrant === 'do' ? '0 0 20px rgba(255,77,77,0.3)' : undefined 
                    }}
                >
                    <Icon 
                        className="w-5 h-5" 
                        style={{ color: info.color }}
                    />
                </div>
                <div className="relative flex-1">
                    <div className="flex items-center gap-2">
                        <h3 
                            className="font-bold text-lg tracking-wide"
                            style={{ color: info.color }}
                        >
                            {info.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                            {tasks.length}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {info.subtitle}
                    </p>
                </div>
            </div>

            {/* Tasks Container */}
            <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                {tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                        <div 
                            className={`p-4 rounded-full ${info.bgClass} mb-3 opacity-50`}
                        >
                            <Icon className="w-8 h-8" style={{ color: info.color }} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {info.description}
                        </p>
                        <p className="text-xs text-muted-foreground/50 mt-1">
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
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-2xl">
                    <div 
                        className="text-lg font-bold flex items-center gap-2"
                        style={{ color: info.color }}
                    >
                        <Icon className="w-6 h-6" />
                        Drop to {info.title}
                    </div>
                </div>
            )}
        </div>
    );
}
