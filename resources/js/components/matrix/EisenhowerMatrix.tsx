import { Quadrant, QUADRANT_INFO, Task } from '@/types/task';
import { Calendar, Trash2, Users, Zap } from 'lucide-react';
import { useState } from 'react';
import { QuadrantPanel } from './QuadrantPanel';

interface EisenhowerMatrixProps {
    tasks: Task[];
    onTaskComplete: (id: number) => void;
    onTaskDelete: (id: number) => void;
    onTaskDrop: (taskId: number, quadrant: Quadrant) => void;
    getTasksByQuadrant: (quadrant: Quadrant) => Task[];
}

const quadrants: Quadrant[] = ['do', 'decide', 'delegate', 'delete'];

export function EisenhowerMatrix({
    tasks,
    onTaskComplete,
    onTaskDelete,
    onTaskDrop,
    getTasksByQuadrant,
}: EisenhowerMatrixProps) {
    const [activeTab, setActiveTab] = useState<Quadrant>('do');

    return (
        <div className="flex h-full w-full flex-col">
            {/* Desktop: 2x2 Grid */}
            <div className="hidden lg:grid lg:h-[calc(100vh-280px)] lg:min-h-[600px] lg:grid-cols-2 lg:grid-rows-2 lg:gap-4">
                {/* Top Row: Urgent */}
                {/* DO: Urgent & Important */}
                <QuadrantPanel
                    quadrant="do"
                    tasks={getTasksByQuadrant('do')}
                    onTaskComplete={onTaskComplete}
                    onTaskDelete={onTaskDelete}
                    onTaskDrop={onTaskDrop}
                />
                {/* DECIDE: Important, Not Urgent */}
                <QuadrantPanel
                    quadrant="decide"
                    tasks={getTasksByQuadrant('decide')}
                    onTaskComplete={onTaskComplete}
                    onTaskDelete={onTaskDelete}
                    onTaskDrop={onTaskDrop}
                />
                {/* Bottom Row: Not Urgent */}
                {/* DELEGATE: Urgent, Not Important */}
                <QuadrantPanel
                    quadrant="delegate"
                    tasks={getTasksByQuadrant('delegate')}
                    onTaskComplete={onTaskComplete}
                    onTaskDelete={onTaskDelete}
                    onTaskDrop={onTaskDrop}
                />
                {/* DELETE: Not Urgent, Not Important */}
                <QuadrantPanel
                    quadrant="delete"
                    tasks={getTasksByQuadrant('delete')}
                    onTaskComplete={onTaskComplete}
                    onTaskDelete={onTaskDelete}
                    onTaskDrop={onTaskDrop}
                />
                {/* Axis Labels */}
                <div className="pointer-events-none absolute top-[280px] left-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
                    <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                        <span>← Important</span>
                        <div className="h-px w-24 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                        <span>Not Important →</span>
                    </div>
                </div>
            </div>

            <div className="lg:hidden">
                {/* Tab Navigation */}
                <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-muted/50 p-1">
                    {quadrants.map((q) => {
                        const info = QUADRANT_INFO[q];
                        const taskCount = getTasksByQuadrant(q).length;
                        const Icon =
                            q === 'do'
                                ? Zap
                                : q === 'decide'
                                  ? Calendar
                                  : q === 'delegate'
                                    ? Users
                                    : Trash2;

                        return (
                            <button
                                key={q}
                                onClick={() => setActiveTab(q)}
                                className={`flex min-w-[80px] flex-1 flex-col items-center gap-1 rounded-lg px-3 py-2.5 transition-all duration-300 ${
                                    activeTab === q
                                        ? `bg-card shadow-lg ${q === 'do' ? 'glow-red' : ''}`
                                        : 'hover:bg-card/50'
                                }`}
                            >
                                <Icon
                                    className="h-5 w-5"
                                    style={{
                                        color:
                                            activeTab === q
                                                ? info.color
                                                : undefined,
                                    }}
                                />
                                <span
                                    className="text-xs font-bold tracking-wider"
                                    style={{
                                        color:
                                            activeTab === q
                                                ? info.color
                                                : undefined,
                                    }}
                                >
                                    {info.title}
                                </span>
                                {taskCount > 0 && (
                                    <span
                                        className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                                        style={{
                                            backgroundColor:
                                                activeTab === q
                                                    ? `${info.color}20`
                                                    : undefined,
                                            color:
                                                activeTab === q
                                                    ? info.color
                                                    : undefined,
                                        }}
                                    >
                                        {taskCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Active Quadrant Content */}
                <div className="min-h-[400px]">
                    <QuadrantPanel
                        quadrant={activeTab}
                        tasks={getTasksByQuadrant(activeTab)}
                        onTaskComplete={onTaskComplete}
                        onTaskDelete={onTaskDelete}
                        onTaskDrop={onTaskDrop}
                    />
                </div>
            </div>
        </div>
    );
}
