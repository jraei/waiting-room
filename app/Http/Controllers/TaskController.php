<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Services\GrokService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function __construct(
        private GrokService $grokService
    ) {}

    /**
     * Display the dashboard with all tasks.
     */
    public function index(): Response
    {
        $tasks = Auth::user()
            ->tasks()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($task) => $this->formatTask($task));

        return Inertia::render('dashboard', [
            'tasks' => $tasks,
        ]);
    }

    /**
     * Store a new task with AI classification.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:500',
        ]);

        // Get AI classification
        $classification = $this->grokService->analyzeTask($validated['title']);

        // Create the task
        $task = Auth::user()->tasks()->create([
            'title' => $validated['title'],
            'quadrant' => $classification['quadrant'],
            'urgency_score' => $classification['urgency_score'],
            'ai_reasoning' => $classification['reasoning'],
            'is_completed' => false,
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'task' => $this->formatTask($task),
            ]);
        }

        return back()->with('success', 'Task created successfully.');
    }

    /**
     * Update task quadrant (for drag & drop).
     */
    public function updateQuadrant(Request $request, Task $task)
    {
        $this->authorize('update', $task);

        $validated = $request->validate([
            'quadrant' => 'required|in:do,decide,delegate,delete',
        ]);

        $task->update([
            'quadrant' => $validated['quadrant'],
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'task' => $this->formatTask($task),
            ]);
        }

        return back();
    }

    /**
     * Mark task as complete.
     */
    public function complete(Task $task)
    {
        $this->authorize('update', $task);

        $task->update([
            'is_completed' => true,
        ]);

        return back();
    }

    /**
     * Delete a task.
     */
    public function destroy(Task $task)
    {
        $this->authorize('delete', $task);

        $task->delete();

        return back();
    }

    /**
     * Format task for frontend consumption.
     */
    private function formatTask(Task $task): array
    {
        return [
            'id' => $task->id,
            'title' => $task->title,
            'description' => $task->description,
            'quadrant' => $task->quadrant,
            'urgency_score' => $task->urgency_score,
            'ai_reasoning' => $task->ai_reasoning,
            'status' => $task->is_completed ? 'completed' : 'pending',
            'user_id' => $task->user_id,
            'created_at' => $task->created_at->toISOString(),
            'updated_at' => $task->updated_at->toISOString(),
        ];
    }
}
