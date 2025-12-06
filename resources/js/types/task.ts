export type Quadrant = 'do' | 'decide' | 'delegate' | 'delete';

export type TaskStatus = 'pending' | 'completed';

export interface Task {
    id: number;
    title: string;
    description?: string;
    quadrant: Quadrant;
    urgency_score: number;
    ai_reasoning: string;
    status: TaskStatus;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface AIClassification {
    quadrant: Quadrant;
    urgency_score: number;
    reasoning: string;
}

export interface QuadrantInfo {
    id: Quadrant;
    title: string;
    subtitle: string;
    description: string;
    icon: string;
    color: string;
    glowClass: string;
    borderClass: string;
    bgClass: string;
}

export const QUADRANT_INFO: Record<Quadrant, QuadrantInfo> = {
    do: {
        id: 'do',
        title: 'DO',
        subtitle: 'Urgent & Important',
        description: 'Critical tasks requiring immediate action',
        icon: 'Zap',
        color: 'hsl(0, 100%, 65%)',
        glowClass: 'glow-red',
        borderClass: 'border-quadrant-do',
        bgClass: 'bg-quadrant-do/10',
    },
    decide: {
        id: 'decide',
        title: 'DECIDE',
        subtitle: 'Important, Not Urgent',
        description: 'Schedule these for focused work',
        icon: 'Calendar',
        color: 'hsl(45, 100%, 55%)',
        glowClass: 'glow-yellow',
        borderClass: 'border-quadrant-decide',
        bgClass: 'bg-quadrant-decide/10',
    },
    delegate: {
        id: 'delegate',
        title: 'DELEGATE',
        subtitle: 'Urgent, Not Important',
        description: 'Assign to others if possible',
        icon: 'Users',
        color: 'hsl(187, 100%, 50%)',
        glowClass: 'glow-cyan',
        borderClass: 'border-quadrant-delegate',
        bgClass: 'bg-quadrant-delegate/10',
    },
    delete: {
        id: 'delete',
        title: 'DELETE',
        subtitle: 'Not Urgent, Not Important',
        description: 'Eliminate or minimize these',
        icon: 'Trash2',
        color: 'hsl(215, 20%, 55%)',
        glowClass: 'glow-purple',
        borderClass: 'border-quadrant-delete',
        bgClass: 'bg-quadrant-delete/10',
    },
};
