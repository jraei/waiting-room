import { useState, useCallback, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { MatrixHeader } from '@/components/matrix/MatrixHeader';
import { BrainDumpInput } from '@/components/matrix/BrainDumpInput';
import { EisenhowerMatrix } from '@/components/matrix/EisenhowerMatrix';
import { useTasks } from '@/hooks/use-tasks';
import { Task, Quadrant } from '@/types/task';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';

interface DashboardProps {
    tasks: Task[];
}

export default function Dashboard({ tasks: initialTasks = [] }: DashboardProps) {
    const { toast } = useToast();
    const {
        tasks,
        isClassifying,
        addTask,
        updateTaskQuadrant,
        completeTask,
        deleteTask,
        getTasksByQuadrant,
    } = useTasks(initialTasks);

    const handleSubmit = useCallback(async (text: string) => {
        const task = await addTask(text);
        if (task) {
            toast({
                title: `Task added to ${task.quadrant.toUpperCase()}`,
                description: task.ai_reasoning,
                duration: 4000,
            });
        }
    }, [addTask, toast]);

    const handleTaskComplete = useCallback((id: number) => {
        completeTask(id);
        toast({
            title: "Task completed!",
            description: "Great work on finishing that task.",
            duration: 2000,
        });
    }, [completeTask, toast]);

    const handleTaskDelete = useCallback((id: number) => {
        deleteTask(id);
        toast({
            title: "Task removed",
            description: "The task has been deleted.",
            duration: 2000,
        });
    }, [deleteTask, toast]);

    const handleTaskDrop = useCallback((taskId: number, quadrant: Quadrant) => {
        updateTaskQuadrant(taskId, quadrant);
        toast({
            title: `Moved to ${quadrant.toUpperCase()}`,
            description: "Task quadrant updated manually.",
            duration: 2000,
        });
    }, [updateTaskQuadrant, toast]);

    return (
        <>
            <Head title="Eisenhower Matrix - AI Task Manager" />
            
            <div className="min-h-screen bg-background grid-bg relative overflow-hidden">
                {/* Ambient Background Effects */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-magenta/5 rounded-full blur-[150px]" />
                </div>

                {/* Main Content */}
                <div className="relative z-10 container mx-auto px-4 py-6 space-y-6 max-w-7xl">
                    {/* Header Section */}
                    <MatrixHeader tasks={tasks} />

                    {/* Brain Dump Input */}
                    <BrainDumpInput 
                        onSubmit={handleSubmit} 
                        isClassifying={isClassifying} 
                    />

                    {/* Eisenhower Matrix */}
                    <EisenhowerMatrix
                        tasks={tasks}
                        onTaskComplete={handleTaskComplete}
                        onTaskDelete={handleTaskDelete}
                        onTaskDrop={handleTaskDrop}
                        getTasksByQuadrant={getTasksByQuadrant}
                    />
                </div>

                {/* Scanlines Overlay */}
                <div className="fixed inset-0 pointer-events-none scanlines opacity-30" />
            </div>

            <Toaster />
        </>
    );
}
