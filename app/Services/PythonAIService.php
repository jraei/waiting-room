<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;

class PythonAIService
{
    /**
     * Analyze a task using local Python model.
     */
    public function analyzeTask(string $taskText): array
    {
        try {
            // Path ke python script
            $scriptPath = base_path('python_ai/predict.py');
            $escapedText = escapeshellarg($taskText);

            $pythonPath = config('services.python.path');

            if (!$pythonPath) {
                throw new Exception("Python path not configured in .env");
            }

            $command = "\"{$pythonPath}\" \"{$scriptPath}\" {$escapedText}";


            $result = Process::env([
                'SystemRoot' => getenv('SystemRoot'), // Wajib untuk Windows
                'PATH' => getenv('PATH'),             // Agar command lain terbaca
            ])->run($command);


            if ($result->failed()) {
                Log::error('Python Script Error', ['output' => $result->errorOutput()]);
                throw new Exception('Failed to execute python script');
            }

            $output = trim($result->output());
            Log::info('Python raw output: ' . $output);

            $data = json_decode($output, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Invalid JSON from Python script');
            }

            logger()->info('Python AI Result: ' . json_encode($data));

            return $this->validateAndNormalize($data);
        } catch (Exception $e) {
            Log::error('Local AI Error', ['message' => $e->getMessage()]);
            return $this->getFallbackClassification($taskText);
        }
    }

    private function validateAndNormalize(array $result): array
    {
        $validQuadrants = ['do', 'decide', 'delegate', 'delete'];
        $quadrant = strtolower($result['quadrant'] ?? 'decide');

        if (!in_array($quadrant, $validQuadrants)) {
            $quadrant = 'decide';
        }

        return [
            'quadrant' => $quadrant,
            'urgency_score' => (int) ($result['urgency_score'] ?? 50),
            'reasoning' => $result['reasoning'] ?? 'Local model classification.',
        ];
    }

    private function getFallbackClassification(string $taskText): array
    {
        // ... (Gunakan logika fallback yang sama seperti di GrokService lama)
        return ['quadrant' => 'decide', 'urgency_score' => 50, 'reasoning' => 'Fallback Logic'];
    }
}
