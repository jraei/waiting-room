<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class GrokService
{
    private string $apiKey;
    private string $apiUrl;
    private string $model;

    public function __construct()
    {
        $this->apiKey = config('services.grok.api_key');
        $this->apiUrl = config('services.grok.api_url', 'https://api.x.ai/v1/chat/completions');
        $this->model = config('services.grok.model', 'grok-3-latest');
    }

    /**
     * Analyze a task and classify it into the Eisenhower Matrix.
     *
     * @param string $taskText The user's task description
     * @return array{quadrant: string, urgency_score: int, reasoning: string}
     * @throws Exception
     */
    public function analyzeTask(string $taskText): array
    {
        $systemPrompt = <<<PROMPT
You are an AI assistant specialized in the Eisenhower Matrix for task prioritization.

Analyze the given task and classify it based on urgency and importance:
- "do": Urgent AND Important - Crisis, deadlines, problems requiring immediate action
- "decide": NOT Urgent BUT Important - Planning, relationships, personal growth, long-term goals  
- "delegate": Urgent BUT NOT Important - Interruptions, some meetings, some calls, tasks others can do
- "delete": NOT Urgent AND NOT Important - Time wasters, pleasant activities, trivia, busy work

You MUST respond with ONLY valid JSON in this exact format:
{"quadrant": "do|decide|delegate|delete", "urgency_score": 0-100, "reasoning": "brief explanation"}

The urgency_score should reflect how time-sensitive the task is (100 = extremely urgent, 0 = no urgency).

Consider context clues like deadlines, keywords (ASAP, urgent, tomorrow, someday), and the nature of the task.
PROMPT;

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post($this->apiUrl, [
                'model' => $this->model,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => "Analyze this task: \"{$taskText}\""],
                ],
                'temperature' => 0.3,
                'max_tokens' => 200,
            ]);

            if (!$response->successful()) {
                Log::error('Grok API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw new Exception('Failed to analyze task with AI: ' . $response->body());
            }

            $data = $response->json();
            $content = $data['choices'][0]['message']['content'] ?? '';

            // Parse JSON from response
            $result = $this->parseJsonResponse($content);

            return $this->validateAndNormalize($result);

        } catch (Exception $e) {
            Log::error('GrokService error', [
                'message' => $e->getMessage(),
                'task' => $taskText,
            ]);

            // Return a sensible fallback
            return $this->getFallbackClassification($taskText);
        }
    }

    /**
     * Parse JSON from the AI response, handling potential markdown wrapping.
     */
    private function parseJsonResponse(string $content): array
    {
        // Remove potential markdown code blocks
        $content = preg_replace('/```json\s*/', '', $content);
        $content = preg_replace('/```\s*/', '', $content);
        $content = trim($content);

        $result = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON response from AI: ' . $content);
        }

        return $result;
    }

    /**
     * Validate and normalize the AI response.
     */
    private function validateAndNormalize(array $result): array
    {
        $validQuadrants = ['do', 'decide', 'delegate', 'delete'];

        $quadrant = strtolower($result['quadrant'] ?? 'decide');
        if (!in_array($quadrant, $validQuadrants)) {
            $quadrant = 'decide';
        }

        $urgencyScore = (int) ($result['urgency_score'] ?? 50);
        $urgencyScore = max(0, min(100, $urgencyScore));

        $reasoning = $result['reasoning'] ?? 'Task classified based on content analysis.';

        return [
            'quadrant' => $quadrant,
            'urgency_score' => $urgencyScore,
            'reasoning' => $reasoning,
        ];
    }

    /**
     * Provide a fallback classification when AI fails.
     */
    private function getFallbackClassification(string $taskText): array
    {
        $taskLower = strtolower($taskText);

        // Simple keyword-based fallback
        $urgentKeywords = ['urgent', 'asap', 'immediately', 'now', 'today', 'deadline', 'emergency'];
        $importantKeywords = ['important', 'critical', 'meeting', 'client', 'boss', 'project'];

        $isUrgent = false;
        $isImportant = false;

        foreach ($urgentKeywords as $keyword) {
            if (str_contains($taskLower, $keyword)) {
                $isUrgent = true;
                break;
            }
        }

        foreach ($importantKeywords as $keyword) {
            if (str_contains($taskLower, $keyword)) {
                $isImportant = true;
                break;
            }
        }

        if ($isUrgent && $isImportant) {
            return ['quadrant' => 'do', 'urgency_score' => 85, 'reasoning' => 'Contains urgent and important indicators.'];
        } elseif ($isImportant) {
            return ['quadrant' => 'decide', 'urgency_score' => 60, 'reasoning' => 'Contains important indicators, schedule appropriately.'];
        } elseif ($isUrgent) {
            return ['quadrant' => 'delegate', 'urgency_score' => 70, 'reasoning' => 'Urgent but may not require your direct attention.'];
        }

        return ['quadrant' => 'decide', 'urgency_score' => 50, 'reasoning' => 'Default classification - review and prioritize as needed.'];
    }
}
