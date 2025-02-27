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
            $_ENV[trim($key)] = trim($value);
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
            $allowedFields = [
                'title',
                'description',
                'hints',
                'feedback',
                'question',
                'tags',
                'completionFeedback',
                'feedbackTexts',
                'correctAnswer'
            ];
            if (!in_array($data['field'], $allowedFields)) {
                throw new Exception('Invalid field value: ' . $data['field']);
            }

            // Get Anthropic API key
            $anthropicKey = $_ENV['ANTHROPIC_API_KEY'];
            debug_log("Checking Anthropic API key - " . (empty($anthropicKey) ? "Not found" : "Found"));
            
            if (!$anthropicKey) {
                throw new Exception('Anthropic API key not configured');
            }

            // Prepare the context for the prompt
            $context = isset($data['context']) ? $data['context'] : [];

            // Get response expectations from context
            $responseExpectations = isset($context['responseExpectations']) ? $context['responseExpectations'] : null;
            if (!$responseExpectations) {
                throw new Exception('Response expectations are required');
            }

            // Validate required context parameters
            if (!isset($context['tokenLimits'])) {
                throw new Exception('Token limits are required in context');
            }
            if (!isset($context['responseCount'])) {
                throw new Exception('Response count is required in context');
            }

            $maxTokens = $context['tokenLimits'];
            $responseCount = $context['responseCount'];

            // Build context object
            $contextObj = [
                'style' => [
                    'writing' => $context['writingStyle'] ?? '',
                    'genre' => $context['gameGenre'] ?? '',
                    'tone' => $context['tone'] ?? ''
                ],
                'gameState' => [
                    'title' => ($data['scope'] ?? 'game') === 'game' && $data['field'] === 'title' ? null : ($context['gameContext']['title'] ?? null),
                    'description' => ($data['scope'] ?? 'game') === 'game' && $data['field'] === 'description' ? null : ($context['gameContext']['description'] ?? null),
                    'additionalContext' => $context['additionalContext'] ?? null
                ],
                'request' => [
                    'field' => $data['field'],
                    'scope' => $data['scope'] ?? 'game',
                    'responseExpectations' => $responseExpectations
                ]
            ];

            // Simple base prompt
            $promptBase = "You are assisting with creating content for an interactive game. ";
            
            if ($responseExpectations) {
                $promptBase .= "The response should be {$responseExpectations['style']} style, ";
                $promptBase .= "between {$responseExpectations['wordCount']['min']} and {$responseExpectations['wordCount']['max']} words. ";
                $promptBase .= "Purpose: {$responseExpectations['description']}. ";
            }

            $promptBase .= "\nPlease return exactly {$responseCount} suggestions in this JSON format: [{\"content\": \"suggestion text\"}].\n";
            $promptBase .= "Keep each suggestion focused and match the required word length. Do not include any additional text or explanations.\n";

            // Generate structured prompt
            $systemPrompt = "You are a creative writing assistant helping to generate content for a game.";
            $prompt = $promptBase . "\n\n" . json_encode($contextObj, JSON_PRETTY_PRINT);

            debug_log("Generated prompt:", $prompt);

            // Prepare Anthropic API request
            $messages = [
                [
                    'role' => 'user',
                    'content' => $prompt
                ]
            ];

            $requestData = [
                'model' => 'claude-3-haiku-20240307',
                'messages' => $messages,
                'max_tokens' => $maxTokens,
                'temperature' => 0.7,
                'system' => $systemPrompt
            ];
            debug_log("Anthropic API request data:", $requestData);

            // Initialize cURL
            $ch = curl_init('https://api.anthropic.com/v1/messages');
            if ($ch === false) {
                debug_log("Failed to initialize cURL");
                throw new Exception("An error occurred while processing your request. Please try again later.");
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
                CURLOPT_SSL_VERIFYHOST => 2
            ];

            // Only use custom cacert.pem in development
            if ($_ENV['APP_ENV'] === 'development') {
                $curlOptions[CURLOPT_CAINFO] = __DIR__ . '/../../config/cacert.pem';
            }
            
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
                debug_log("cURL Error: " . $error);
                curl_close($ch);
                throw new Exception("Unable to connect to the AI service. Please try again later.");
            }
            
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode !== 200) {
                debug_log("API Error - HTTP Code: " . $httpCode . ", Response: " . $response);
                throw new Exception("The AI service is temporarily unavailable. Please try again in a few minutes.");
            }

            // Parse the response
            $responseData = json_decode($response, true);
            debug_log("Raw API Response:", [
                'length' => strlen($response),
                'first_100_chars' => substr($response, 0, 100),
                'last_100_chars' => substr($response, -100),
                'json_error' => json_last_error(),
                'json_error_msg' => json_last_error_msg()
            ]);

            // Extract the content from Anthropic response
            if (!isset($responseData['content'][0]['text'])) {
                throw new Exception('Invalid response format from Anthropic API');
            }

            $aiResponse = $responseData['content'][0]['text'];
            debug_log("AI Response Text (first 100 chars):", substr($aiResponse, 0, 100));

            // Extract the array structure
            if (!preg_match('/\[(.*)\]/s', $aiResponse, $matches)) {
                throw new Exception('Invalid response format - expected array structure');
            }
            
            // Process each suggestion individually
            $items = explode('},{', trim($matches[1], '{}'));
            $suggestions = [];
            
            foreach ($items as $item) {
                // Clean up the item
                $item = trim($item);
                if (empty($item)) continue;
                
                // Extract content value using a more flexible pattern
                if (preg_match('/"content"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"/s', $item, $contentMatch)) {
                    $content = $contentMatch[1];
                    // Let PHP handle the JSON encoding
                    $suggestions[] = ['content' => $content];
                }
            }
            
            debug_log("Processed suggestions:", [
                'count' => count($suggestions),
                'first_item' => isset($suggestions[0]) ? substr(json_encode($suggestions[0]), 0, 100) : 'none'
            ]);

            if (empty($suggestions)) {
                throw new Exception('No valid suggestions found in AI response');
            }

            // Additional validation for story description
            if ($data['field'] === 'description' || $data['field'] === 'story') {
                $suggestions = array_map(function($item) {
                    if (isset($item['content'])) {
                        $item['content'] = str_replace(["\r", "\n"], " ", $item['content']);
                        $item['content'] = preg_replace('/\s+/', ' ', $item['content']);
                        $item['content'] = trim($item['content']);
                    }
                    return $item;
                }, $suggestions);
            }

            // Ensure we have the correct number of suggestions
            $suggestions = array_slice($suggestions, 0, $responseCount);

            // Map suggestions to the expected format
            $formattedSuggestions = array_map(function($item) {
                return isset($item['content']) ? $item['content'] : '';
            }, $suggestions);

            // Return in standard API format
            $returnData = [
                'status' => 'success',
                'data' => [
                    'suggestions' => $formattedSuggestions
                ],
                'message' => 'Successfully generated suggestions'
            ];

            debug_log("Returning formatted response:", [
                'suggestion_count' => count($formattedSuggestions),
                'response_structure' => array_keys($returnData),
                'first_suggestion_preview' => isset($formattedSuggestions[0]) ? 
                    substr($formattedSuggestions[0], 0, 50) . '...' : 'none'
            ]);

            echo json_encode($returnData);

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
