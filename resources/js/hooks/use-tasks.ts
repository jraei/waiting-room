import { toast } from '@/hooks/use-toast';
import { Quadrant, Task } from '@/types/task';
import axios from 'axios';
import { useCallback, useState } from 'react';

export function useTasks(initialTasks: Task[] = []) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [isLoading, setIsLoading] = useState(false);
    const [isClassifying, setIsClassifying] = useState(false);

    const addTask = useCallback(async (text: string): Promise<Task | null> => {
        if (!text.trim()) return null;

        setIsClassifying(true);

        try {
            const response = await axios.post('/tasks', { title: text.trim() });
            const newTask: Task = response.data.task;

            setTasks((prev) => [...prev, newTask]);

            toast({
                title: 'Task classified',
                description: `Added to "${newTask.quadrant.toUpperCase()}" quadrant`,
            });

            return newTask;
        } catch (error) {
            console.error('Failed to add task:', error);
            toast({
                title: 'Error',
                description: 'Failed to classify task. Please try again.',
                variant: 'destructive',
            });
            return null;
        } finally {
            setIsClassifying(false);
        }
    }, []);

    const updateTaskQuadrant = useCallback(
        (taskId: number, newQuadrant: Quadrant) => {
            // Optimistic update
            let previousTask: Task | undefined;

            setTasks((prev) =>
                prev.map((task) => {
                    if (task.id === taskId) {
                        previousTask = task;
                        return {
                            ...task,
                            quadrant: newQuadrant,
                            updated_at: new Date().toISOString(),
                        };
                    }
                    return task;
                }),
            );

            // Send request silently
            axios
                .patch(`/tasks/${taskId}/quadrant`, { quadrant: newQuadrant })
                .catch((error) => {
                    console.error('Failed to update quadrant:', error);

                    // Revert on failure
                    if (previousTask) {
                        setTasks((prev) =>
                            prev.map((task) =>
                                task.id === taskId ? previousTask! : task,
                            ),
                        );
                    }

                    toast({
                        title: 'Error',
                        description: 'Failed to move task. Reverting change.',
                        variant: 'destructive',
                    });
                });
        },
        [],
    );

    const completeTask = useCallback((taskId: number) => {
        // Optimistic update
        let previousTask: Task | undefined;

        setTasks((prev) =>
            prev.map((task) => {
                if (task.id === taskId) {
                    previousTask = task;
                    return {
                        ...task,
                        status: 'completed',
                        updated_at: new Date().toISOString(),
                    };
                }
                return task;
            }),
        );

        // Send request silently
        axios.post(`/tasks/${taskId}/complete`).catch((error) => {
            console.error('Failed to complete task:', error);

            // Revert on failure
            if (previousTask) {
                setTasks((prev) =>
                    prev.map((task) =>
                        task.id === taskId ? previousTask! : task,
                    ),
                );
            }

            toast({
                title: 'Error',
                description: 'Failed to complete task. Reverting change.',
                variant: 'destructive',
            });
        });
    }, []);

    const deleteTask = useCallback((taskId: number) => {
        // Optimistic update
        let deletedTask: Task | undefined;

        setTasks((prev) => {
            deletedTask = prev.find((task) => task.id === taskId);
            return prev.filter((task) => task.id !== taskId);
        });

        // Send request silently
        axios.delete(`/tasks/${taskId}`).catch((error) => {
            console.log('Failed to delete task:', error);

            // Revert on failure
            if (deletedTask) {
                setTasks((prev) => [...prev, deletedTask!]);
            }

            toast({
                title: 'Error',
                description: 'Failed to delete task. Reverting change.',
                variant: 'destructive',
            });
        });
    }, []);

    const getTasksByQuadrant = useCallback(
        (quadrant: Quadrant) => {
            return tasks
                .filter(
                    (task) =>
                        task.quadrant === quadrant && task.status === 'pending',
                )
                .sort((a, b) => b.urgency_score - a.urgency_score);
        },
        [tasks],
    );

    return {
        tasks,
        isLoading,
        isClassifying,
        addTask,
        updateTaskQuadrant,
        completeTask,
        deleteTask,
        getTasksByQuadrant,
    };
}
