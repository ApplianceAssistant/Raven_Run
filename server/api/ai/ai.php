<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php_errors.log');

require_once (__DIR__ . '/../../utils/errorHandler.php');
require_once (__DIR__ . '/../../auth/auth.php');

ini_set('default_charset', 'UTF-8');
mb_internal_encoding('UTF-8');

// Debug logging function
function debug_log($message, $data = null) {
    $log_message = date('Y-m-d H:i:s') . " - " . $message;
    if ($data !== null) {
        $log_message .= "\nData: " . print_r($data, true);
    }
    error_log($log_message);
}

// Set content type to JSON with UTF-8
header('Content-Type: application/json; charset=utf-8');

// Handle CORS
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header("Access-Control-Allow-Methods: POST, OPTIONS");
    }
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }
    exit(0);
}

$envFile = __DIR__ . '/../../../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            putenv(trim($key) . "=" . trim($value));
        }
    }
} else {
    throw new Exception('.env file not found');
}

try {
    debug_log("Request started");
    
    // Get the request method
    $method = $_SERVER['REQUEST_METHOD'];
    debug_log("Request method: " . $method);

    switch ($method) {
        case 'POST':
            // Get JSON body
            $rawInput = file_get_contents('php://input');
            debug_log("Raw input received:", $rawInput);
            
            $data = json_decode($rawInput, true);
            debug_log("Decoded JSON data:", $data);
            
            // Validate required fields
            if (!isset($data['field'])) {
                throw new Exception('Field parameter is required');
            }

            // Validate field value
            $allowedFields = ['title', 'description', 'hints', 'feedback', 'question', 'tags'];
            if (!in_array($data['field'], $allowedFields)) {
                throw new Exception('Invalid field value: ' . $data['field']);
            }

            // Get Anthropic API key
            $anthropicKey = getenv('ANTHROPIC_API_KEY');
            debug_log("Checking Anthropic API key - " . (empty($anthropicKey) ? "Not found" : "Found"));
            
            if (!$anthropicKey) {
                throw new Exception('Anthropic API key not configured');
            }

            // Prepare the context for the prompt
            $context = isset($data['context']) ? $data['context'] : [];
            $existingContent = isset($data['existingContent']) ? $data['existingContent'] : '';
            debug_log("Context:", $context);
            debug_log("Existing content:", $existingContent);

            // Build the base context
            $baseContext = "You are helping create content for a location-based game. ";
            if (isset($context['title'])) {
                $baseContext .= "The game is called \"{$context['title']}\". ";
            }
            if (isset($context['description'])) {
                $baseContext .= "Game description: \"{$context['description']}\". ";
            }
            if (isset($context['difficulty_level'])) {
                $baseContext .= "Difficulty level: {$context['difficulty_level']}. ";
            }

            // Get prompt based on field
            $prompts = [
                'title' => $baseContext . "Please suggest a creative and engaging title for this game.",
                'description' => $baseContext . "Please write an engaging description that explains what this game is about.",
                'hints' => $baseContext . "Please suggest helpful but not too obvious hints for this challenge.",
                'feedback' => $baseContext . "Please suggest encouraging " . ($context['feedbackType'] ?? '') . " feedback messages.",
                'question' => $baseContext . "Please suggest an engaging question related to this location or challenge.",
                'tags' => $baseContext . "Please suggest relevant tags for this game based on its content and theme."
            ];

            $prompt = $prompts[$data['field']];
            if ($existingContent) {
                $prompt .= " Current content to improve: \"$existingContent\"";
            }
            debug_log("Generated prompt:", $prompt);

            // Prepare Anthropic API request
            $requestData = [
                'model' => 'claude-3-haiku-20240307',
                'max_tokens' => 1000,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt]
                ]
            ];
            debug_log("Anthropic API request data:", $requestData);

            // Initialize cURL
            $ch = curl_init('https://api.anthropic.com/v1/messages');
            if ($ch === false) {
                throw new Exception('Failed to initialize cURL');
            }

            // Set cURL options
            $curlOptions = [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_HTTPHEADER => [
                    'Content-Type: application/json',
                    'x-api-key: ' . $anthropicKey,
                    'anthropic-version: 2023-06-01'
                ],
                CURLOPT_POSTFIELDS => json_encode($requestData),
                CURLOPT_VERBOSE => true,
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_SSL_VERIFYHOST => 2,
                CURLOPT_CAINFO => __DIR__ . '/../../config/cacert.pem'
            ];
            
            // Debug cURL options (excluding sensitive data)
            $debugOptions = $curlOptions;
            unset($debugOptions[CURLOPT_POSTFIELDS]);
            debug_log("Setting cURL options:", $debugOptions);
            
            curl_setopt_array($ch, $curlOptions);

            // Create a temporary file for cURL verbose output
            $verbose = fopen('php://temp', 'w+');
            curl_setopt($ch, CURLOPT_STDERR, $verbose);

            // Execute cURL request
            debug_log("Executing Anthropic API request");
            $response = curl_exec($ch);
            
            // Log cURL verbose output
            rewind($verbose);
            $verboseLog = stream_get_contents($verbose);
            debug_log("cURL verbose output:", $verboseLog);
            fclose($verbose);

            // Check for cURL errors
            if ($response === false) {
                $error = curl_error($ch);
                $errno = curl_errno($ch);
                debug_log("cURL error occurred:", "Error $errno: $error");
                throw new Exception("cURL error $errno: $error");
            }

            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            debug_log("Anthropic API response code: " . $httpCode);
            debug_log("Anthropic API raw response:", $response);
            
            curl_close($ch);

            if ($httpCode !== 200) {
                throw new Exception("Anthropic API request failed with status $httpCode: $response");
            }

            $anthropicResponse = json_decode($response, true);
            debug_log("Decoded Anthropic response:", $anthropicResponse);
            
            if (!$anthropicResponse || !isset($anthropicResponse['content'][0]['text'])) {
                throw new Exception('Invalid response from AI service: ' . json_last_error_msg());
            }

            // Process suggestions
            $suggestions = array_slice(
                array_filter(
                    array_map(
                        'trim',
                        explode("\n", $anthropicResponse['content'][0]['text'])
                    ),
                    function($line) { return !empty($line); }
                ),
                0,
                3
            );
            debug_log("Processed suggestions:", $suggestions);

            echo json_encode([
                'status' => 'success',
                'data' => [
                    'suggestions' => $suggestions
                ],
                'message' => 'Successfully generated suggestions'
            ]);
            debug_log("Request completed successfully");
            break;

        default:
            throw new Exception('Method not allowed');
    }

} catch (Exception $e) {
    $errorMessage = $e->getMessage();
    $errorTrace = $e->getTraceAsString();
    debug_log("ERROR: " . $errorMessage);
    debug_log("Stack trace:", $errorTrace);
    
    error_log("Exception in AI endpoint: " . $errorMessage);
    error_log("Stack trace: " . $errorTrace);
    
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $errorMessage,
        'data' => null
    ]);
}
