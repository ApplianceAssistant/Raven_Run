<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php_errors.log');

require_once (__DIR__ . '/../../utils/errorHandler.php');
require_once (__DIR__ . '/../../auth/auth.php');
require_once (__DIR__ . '/../../utils/db_connection.php');

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
    
    // Attempt to get authenticated user
    $authenticatedUser = authenticateUser();
    $userId = $authenticatedUser ? $authenticatedUser['id'] : null;
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    
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
                $curlError = curl_error($ch);
                $curlErrno = curl_errno($ch);
                debug_log("cURL error: " . $curlError . " (errno: " . $curlErrno . ")");
                curl_close($ch);
                throw new Exception("Failed to communicate with AI service: " . $curlError, $curlErrno);
            }
            curl_close($ch);

            debug_log("Raw Anthropic API response:", $response);

            $responseData = json_decode($response, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                debug_log("JSON decode error for Anthropic response: " . json_last_error_msg(), [
                    'response_start' => substr($response, 0, 200),
                    'response_end' => substr($response, -200)
                ]);
                throw new Exception('Invalid JSON response from AI service: ' . json_last_error_msg());
            }
            debug_log("Decoded Anthropic response data:", $responseData);

            // Extract token usage - Anthropic specific
            $inputTokens = $responseData['usage']['input_tokens'] ?? 0;
            $outputTokens = $responseData['usage']['output_tokens'] ?? 0;
            $modelUsed = $responseData['model'] ?? 'Anthropic Claude'; // Or a more specific model if available

            // Extract the content from Anthropic response
            if (!isset($responseData['content'][0]['text'])) {
                throw new Exception('Invalid response format from Anthropic API');
            }

            $aiResponse = $responseData['content'][0]['text'];
            debug_log("AI Response Text:", $aiResponse);

            // Clean and sanitize the response
            $aiResponse = preg_replace('/[\x00-\x1F\x7F]/', '', $aiResponse);
            
            debug_log("Cleaned AI Response Text:", $aiResponse);

            // Extract the array structure
            if (!preg_match('/\[(.*)\]/s', $aiResponse, $matches)) {
                throw new Exception('Invalid response format - expected array structure');
            }
            
            // Process each suggestion individually by splitting on "},{"
            $items = preg_split('/},\s*{/', trim($matches[1], '{}'));
            
            debug_log("Array items:", $items);
            
            $suggestions = [];
            
            foreach ($items as $index => $item) {
                // Add back the curly braces that were removed by the split
                if ($index === 0) {
                    $item = $item . '}';
                } else if ($index === count($items) - 1) {
                    $item = '{' . $item;
                } else {
                    $item = '{' . $item . '}';
                }
                
                // Clean up the item
                $item = trim($item);
                if (empty($item)) continue;
                
                // Extract content value using a more flexible pattern
                if (preg_match('/"content"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"/s', $item, $contentMatch)) {
                    $content = $contentMatch[1];
                    // Clean special characters and normalize whitespace
                    $content = str_replace(["\r", "\n"], " ", $content);
                    $content = preg_replace('/\s+/', ' ', $content);
                    $content = trim($content);
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

            debug_log("Valid suggestions:", $suggestions);
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

            debug_log("Valid suggestions after validation:", $suggestions);
            // Map suggestions to the expected format and ensure we get all of them
            $formattedSuggestions = array_map(function($item) {
                return isset($item['content']) ? $item['content'] : '';
            }, $suggestions);

            debug_log("Formatted suggestions:", $formattedSuggestions);
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

            // Log AI API Usage
            try {
                $conn = getDbConnection();
                if ($conn) {
                    $stmt = $conn->prepare("INSERT INTO AiApiUsage (user_id, ip_address, model_used, input_tokens, output_tokens) VALUES (?, ?, ?, ?, ?)");
                    if ($stmt) {
                        $stmt->bind_param("issii", $userId, $ipAddress, $modelUsed, $inputTokens, $outputTokens);
                        if (!$stmt->execute()) {
                            debug_log("Failed to log AI usage to DB: " . $stmt->error);
                        }
                        $stmt->close();
                    } else {
                        debug_log("Failed to prepare AI usage logging statement: " . $conn->error);
                    }
                    // Do not close $conn here if it's a persistent connection managed elsewhere
                } else {
                    debug_log("Failed to get DB connection for AI usage logging.");
                }
            } catch (Exception $logDbException) {
                debug_log("Exception while logging AI usage to DB: " . $logDbException->getMessage());
            }

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
