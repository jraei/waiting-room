import { BrainDumpInput } from '@/components/matrix/BrainDumpInput';
import { EisenhowerMatrix } from '@/components/matrix/EisenhowerMatrix';
import { MatrixHeader } from '@/components/matrix/MatrixHeader';
import { Toaster } from '@/components/ui/toaster';
import { useTasks } from '@/hooks/use-tasks';
import { useToast } from '@/hooks/use-toast';
import { Quadrant, Task } from '@/types/task';
import { Head } from '@inertiajs/react';
import { useCallback } from 'react';

interface DashboardProps {
    tasks: Task[];
}

export default function Dashboard({
    tasks: initialTasks = [],
}: DashboardProps) {
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

    const handleSubmit = useCallback(
        async (text: string) => {
            const task = await addTask(text);
            if (task) {
                toast({
                    title: `Task added to ${task.quadrant.toUpperCase()}`,
                    description: task.ai_reasoning,
                    duration: 4000,
                });
            }
        },
        [addTask, toast],
    );

    const handleTaskComplete = useCallback(
        (id: number) => {
            completeTask(id);
            toast({
                title: 'Task completed!',
                description: 'Great work on finishing that task.',
                duration: 2000,
            });
        },
        [completeTask, toast],
    );

    const handleTaskDelete = useCallback(
        (id: number) => {
            deleteTask(id);
            toast({
                title: 'Task removed',
                description: 'The task has been deleted.',
                duration: 2000,
            });
        },
        [deleteTask, toast],
    );

    const handleTaskDrop = useCallback(
        (taskId: number, quadrant: Quadrant) => {
            updateTaskQuadrant(taskId, quadrant);
            toast({
                title: `Moved to ${quadrant.toUpperCase()}`,
                description: 'Task quadrant updated manually.',
                duration: 2000,
            });
        },
        [updateTaskQuadrant, toast],
    );

    return (
        <>
            <Head title="Eisenhower Matrix - AI Task Manager" />

            <div className="grid-bg relative min-h-screen overflow-hidden bg-background">
                {/* Ambient Background Effects */}
                <div className="pointer-events-none fixed inset-0">
                    <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
                    <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />
                    <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-magenta/5 blur-[150px]" />
                </div>

                {/* Main Content */}
                <div className="relative z-10 container mx-auto max-w-7xl space-y-6 px-4 py-6">
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
                <div className="scanlines pointer-events-none fixed inset-0 opacity-30" />
            </div>

            <Toaster />
        </>
    );
}
