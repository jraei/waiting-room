import { AIClassification, Quadrant, Task } from '@/types/task';
import { useCallback, useState } from 'react';

// Mock AI classification for demo purposes
// In production, this would call the Laravel backend which talks to Grok API
const mockAIClassify = async (text: string): Promise<AIClassification> => {
    // Simulate API delay
    await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 1000),
    );

    const lowerText = text.toLowerCase();

    // Simple keyword-based classification for demo
    let quadrant: Quadrant = 'delete';
    let urgency_score = 20;
    let reasoning = '';

    const urgentKeywords = [
        'today',
        'now',
        'asap',
        'urgent',
        'immediately',
        'deadline',
        'before',
        'pm',
        'am',
        'hour',
    ];
    const importantKeywords = [
        'important',
        'critical',
        'must',
        'need',
        'required',
        'essential',
        'pay',
        'bill',
        'meeting',
        'call',
        'doctor',
        'health',
    ];
    const delegateKeywords = [
        'someone',
        'team',
        'help',
        'assist',
        'assign',
        'ask',
    ];
    const lowPriorityKeywords = [
        'someday',
        'maybe',
        'later',
        'eventually',
        'learn',
        'try',
        'want',
        'wish',
    ];

    const hasUrgent = urgentKeywords.some((k) => lowerText.includes(k));
    const hasImportant = importantKeywords.some((k) => lowerText.includes(k));
    const hasDelegate = delegateKeywords.some((k) => lowerText.includes(k));
    const hasLowPriority = lowPriorityKeywords.some((k) =>
        lowerText.includes(k),
    );

    if (hasUrgent && hasImportant) {
        quadrant = 'do';
        urgency_score = 80 + Math.floor(Math.random() * 20);
        reasoning =
            'Classified as DO because it has both a time-sensitive deadline and high importance indicators.';
    } else if (hasImportant && !hasUrgent) {
        quadrant = 'decide';
        urgency_score = 50 + Math.floor(Math.random() * 20);
        reasoning =
            "Classified as DECIDE because it's important but lacks immediate urgency. Schedule dedicated time for this.";
    } else if (hasUrgent && hasDelegate) {
        quadrant = 'delegate';
        urgency_score = 40 + Math.floor(Math.random() * 20);
        reasoning =
            'Classified as DELEGATE because while time-sensitive, this task could be handled by others.';
    } else if (hasUrgent && !hasImportant) {
        quadrant = 'delegate';
        urgency_score = 35 + Math.floor(Math.random() * 20);
        reasoning =
            "Classified as DELEGATE because it's urgent but not critical to your goals. Consider delegating.";
    } else if (hasLowPriority) {
        quadrant = 'delete';
        urgency_score = 10 + Math.floor(Math.random() * 15);
        reasoning =
            'Classified as DELETE because it lacks both urgency and clear importance. Consider if it truly adds value.';
    } else {
        // Default classification
        quadrant = 'decide';
        urgency_score = 30 + Math.floor(Math.random() * 20);
        reasoning =
            'Classified as DECIDE by default. Review to determine actual priority level.';
    }

    return { quadrant, urgency_score, reasoning };
};

let taskIdCounter = 1;

export function useTasks(initialTasks: Task[] = []) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [isLoading, setIsLoading] = useState(false);
    const [isClassifying, setIsClassifying] = useState(false);

    const addTask = useCallback(async (text: string): Promise<Task | null> => {
        if (!text.trim()) return null;

        setIsClassifying(true);

        try {
            const classification = await mockAIClassify(text);

            const newTask: Task = {
                id: taskIdCounter++,
                title: text.trim(),
                description: '',
                quadrant: classification.quadrant,
                urgency_score: classification.urgency_score,
                ai_reasoning: classification.reasoning,
                status: 'pending',
                user_id: 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            setTasks((prev) => [...prev, newTask]);
            return newTask;
        } catch (error) {
            console.error('Failed to classify task:', error);
            return null;
        } finally {
            setIsClassifying(false);
        }
    }, []);

    const updateTaskQuadrant = useCallback(
        (taskId: number, newQuadrant: Quadrant) => {
            setTasks((prev) =>
                prev.map((task) =>
                    task.id === taskId
                        ? {
                              ...task,
                              quadrant: newQuadrant,
                              updated_at: new Date().toISOString(),
                          }
                        : task,
                ),
            );
        },
        [],
    );

    const completeTask = useCallback((taskId: number) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === taskId
                    ? {
                          ...task,
                          status: 'completed',
                          updated_at: new Date().toISOString(),
                      }
                    : task,
            ),
        );
    }, []);

    const deleteTask = useCallback((taskId: number) => {
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
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
