<?php

namespace App\Services;

use Exception;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;

class GrokService
{
    private string $apiKey;
    private string $apiUrl;
    private string $model;
    private Client $client;

    public function __construct()
    {
        $this->apiKey = config('services.grok.api_key');
        // Base URL diset ke root API grok agar lebih rapi
        $this->apiUrl = 'https://api.groq.com/openai/v1/';
        $this->model = config('services.grok.model', 'llama-3.3-70b-versatile');

        // Inisialisasi Guzzle Client
        $this->client = new Client([
            'base_uri' => $this->apiUrl,
            'timeout'  => 15.0, // Timeout 15 detik
            'headers'  => [
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type'  => 'application/json',
                'Accept'        => 'application/json',
            ],
        ]);
    }

    /**
     * Analyze a task and classify it into the Eisenhower Matrix using grok.
     *
     * @param string $taskText The user's task description
     * @return array{quadrant: string, urgency_score: int, reasoning: string}
     * @throws Exception
     */
    public function analyzeTask(string $taskText): array
    {
        $systemPrompt = <<<PROMPT
You are an AI assistant specialized in the Eisenhower Matrix.

Analyze the task and classify based on urgency and importance:
- "do": Urgent + Important
- "decide": Not Urgent + Important
- "delegate": Urgent + Not Important
- "delete": Not Urgent + Not Important

IMPORTANT:
- You MUST respond with RAW JSON only.
- Do NOT use markdown code blocks (```json).
- Do NOT include any introductory text.

Format:
{"quadrant": "do|decide|delegate|delete", "urgency_score": 0-100, "reasoning": "explanation"}
PROMPT;

        try {
            // Melakukan Request POST menggunakan Guzzle
            $response = $this->client->post('chat/completions', [
                'json' => [
                    'model' => $this->model,
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => "Analyze this task: \"{$taskText}\""],
                    ],
                    'temperature' => 0.1,
                    'max_tokens' => 512,
                ]
            ]);

            // Mengambil isi body response
            $body = $response->getBody()->getContents();
            $data = json_decode($body, true);

            // Validasi struktur response grok/OpenAI
            if (!isset($data['choices'][0]['message']['content'])) {
                throw new Exception('Unexpected API response structure: ' . $body);
            }

            $content = $data['choices'][0]['message']['content'];
            logger('grok response: ' . $content);

            // Parse JSON dari konten AI
            $result = $this->parseJsonResponse($content);

            return $this->validateAndNormalize($result);
        } catch (RequestException $e) {
            // Menangani error HTTP (4xx, 5xx) dari Guzzle
            $responseBody = $e->hasResponse() ? $e->getResponse()->getBody()->getContents() : 'No response';

            Log::error('grok Guzzle API Error', [
                'message' => $e->getMessage(),
                'response' => $responseBody
            ]);

            return $this->getFallbackClassification($taskText);
        } catch (GuzzleException $e) {
            // Menangani error koneksi Guzzle lainnya
            Log::error('grok Guzzle Connection Error', ['message' => $e->getMessage()]);
            return $this->getFallbackClassification($taskText);
        } catch (Exception $e) {
            // Menangani error umum/parsing
            Log::error('grok General Error', ['message' => $e->getMessage()]);
            return $this->getFallbackClassification($taskText);
        }
    }

    /**
     * Parse JSON from the AI response.
     */
    private function parseJsonResponse(string $content): array
    {
        // Cleanup markdown json wrapper if present (Llama sometimes adds it even in json mode)
        $content = preg_replace('/^```json\s*/', '', $content);
        $content = preg_replace('/```$/', '', $content);
        $content = trim($content);

        $result = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            // Log raw content for debugging if JSON fails
            Log::warning('grok Invalid JSON', ['content' => $content]);
            throw new Exception('Invalid JSON response from AI');
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

        $urgentKeywords = ['urgent', 'asap', 'immediately', 'now', 'today', 'deadline', 'emergency'];
        $importantKeywords = ['important', 'critical', 'meeting', 'client', 'boss', 'project', 'goal'];

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

        // Logic Eisenhower Matrix
        if ($isUrgent && $isImportant) {
            return ['quadrant' => 'do', 'urgency_score' => 90, 'reasoning' => 'Fallback: Urgent and important keywords detected.'];
        } elseif ($isImportant) {
            return ['quadrant' => 'decide', 'urgency_score' => 60, 'reasoning' => 'Fallback: Important keywords detected.'];
        } elseif ($isUrgent) {
            return ['quadrant' => 'delegate', 'urgency_score' => 70, 'reasoning' => 'Fallback: Urgent keywords detected.'];
        }

        return ['quadrant' => 'decide', 'urgency_score' => 40, 'reasoning' => 'Fallback: Default classification.'];
    }
}
