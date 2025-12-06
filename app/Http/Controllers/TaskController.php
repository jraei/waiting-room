<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use App\Services\GrokService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

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
        $tasks = Auth::user()->tasks()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($task) => $this->formatTask($task));

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
     * Update task quadrant (drag & drop).
     */
    public function updateQuadrant(Request $request, Task $task)
    {
        // Security Check: Pastikan task milik user yang sedang login
        if ($task->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'quadrant' => 'required|in:do,decide,delegate,delete',
        ]);

        $task->update([
            'quadrant' => $validated['quadrant'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Task moved successfully.',
            'task' => $task
        ]);
    }

    /**
     * Mark task as complete.
     */
    public function complete(Task $task)
    {
        // Security Check
        if ($task->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Toggle status (opsional: bisa dibuat toggle atau strict complete)
        $task->update([
            'is_completed' => true, // atau !$task->is_completed jika ingin toggle
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Task marked as completed.',
            'task' => $task
        ]);
    }

    /**
     * Remove the specified task from storage.
     * INI YANG MENYEABABKAN ERROR 500 JIKA TIDAK ADA
     */
    public function destroy(Task $task)
    {
        // 1. Security Check: Cegah user menghapus task orang lain
        if ($task->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            // 2. Hapus Task
            $task->delete();

            // 3. Return JSON sukses
            return response()->json([
                'success' => true,
                'message' => 'Task deleted successfully.'
            ]);
        } catch (\Exception $e) {
            Log::error('Delete Task Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete task.'
            ], 500);
        }
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
