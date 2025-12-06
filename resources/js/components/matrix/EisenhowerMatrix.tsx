import { useState } from 'react';
import { Zap, Calendar, Users, Trash2 } from 'lucide-react';
import { Task, Quadrant, QUADRANT_INFO } from '@/types/task';
import { QuadrantPanel } from './QuadrantPanel';
import { TaskCard } from './TaskCard';

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
        <div className="w-full">
            {/* Desktop: 2x2 Grid */}
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4 lg:h-[calc(100vh-280px)] lg:min-h-[600px]">
                {/* Top Row: Urgent */}
                <div className="col-span-2 grid grid-cols-2 gap-4 h-1/2">
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
                </div>

                {/* Bottom Row: Not Urgent */}
                <div className="col-span-2 grid grid-cols-2 gap-4 h-1/2">
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
                </div>

                {/* Axis Labels */}
                <div className="absolute left-1/2 top-[280px] -translate-x-1/2 -translate-y-1/2 pointer-events-none hidden lg:block">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <span>← Important</span>
                        <div className="w-24 h-px bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                        <span>Not Important →</span>
                    </div>
                </div>
            </div>

            {/* Mobile/Tablet: Tabbed View */}
            <div className="lg:hidden">
                {/* Tab Navigation */}
                <div className="flex gap-1 p-1 mb-4 rounded-xl bg-muted/50 overflow-x-auto">
                    {quadrants.map((q) => {
                        const info = QUADRANT_INFO[q];
                        const taskCount = getTasksByQuadrant(q).length;
                        const Icon = q === 'do' ? Zap : q === 'decide' ? Calendar : q === 'delegate' ? Users : Trash2;

                        return (
                            <button
                                key={q}
                                onClick={() => setActiveTab(q)}
                                className={`flex-1 min-w-[80px] flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                                    activeTab === q
                                        ? `bg-card shadow-lg ${q === 'do' ? 'glow-red' : ''}`
                                        : 'hover:bg-card/50'
                                }`}
                            >
                                <Icon 
                                    className="w-5 h-5" 
                                    style={{ color: activeTab === q ? info.color : undefined }}
                                />
                                <span 
                                    className="text-xs font-bold tracking-wider"
                                    style={{ color: activeTab === q ? info.color : undefined }}
                                >
                                    {info.title}
                                </span>
                                {taskCount > 0 && (
                                    <span 
                                        className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                                        style={{ 
                                            backgroundColor: activeTab === q ? `${info.color}20` : undefined,
                                            color: activeTab === q ? info.color : undefined
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
