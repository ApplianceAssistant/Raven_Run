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

            // Get response expectations from context
            $responseExpectations = isset($context['responseExpectations']) ? $context['responseExpectations'] : null;
            $challengeType = isset($context['challengeType']) ? $context['challengeType'] : null;
            
            // Determine response type based on field and response expectations
            $responseType = 'shortList'; // default
            if (in_array($data['field'], ['description', 'story', 'narrative'])) {
                $responseType = 'longForm';
            } elseif (in_array($data['field'], ['feedback', 'challenge_prompt', 'quest_objective'])) {
                $responseType = 'mediumList';
            }

            // Get response limit based on type
            $responseLimits = [
                'shortList' => ['count' => 5, 'fields' => ['title', 'clue', 'hint', 'location_name']],
                'mediumList' => ['count' => 3, 'fields' => ['feedback', 'challenge_prompt', 'quest_objective']],
                'longForm' => ['count' => 2, 'fields' => ['description', 'story', 'narrative']]
            ];
            $responseCount = $responseLimits[$responseType]['count'];

            // Define token limits based on response type
            $tokenLimits = [
                'shortList' => 300,  // For titles, hints, etc.
                'mediumList' => 600, // For feedback, prompts
                'longForm' => 1000   // For descriptions, stories
            ];

            // Get token limit based on response type
            $maxTokens = $tokenLimits[$responseType];

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
                    'type' => $responseType,
                    'field' => $data['field'],
                    'count' => $responseCount
                ]
            ];

            // Add format requirements to prompt
            $promptBase = "You are assisting with creating content for an interactive game. ";
            
            if ($challengeType) {
                $promptBase .= "This is for a {$challengeType} type challenge. ";
            }

            if ($responseExpectations) {
                $promptBase .= "The response should be {$responseExpectations['style']} style, ";
                $promptBase .= "between {$responseExpectations['wordCount']['min']} and {$responseExpectations['wordCount']['max']} words. ";
                $promptBase .= "Purpose: {$responseExpectations['description']}. ";
            }

            // Add existing challenges context if available
            if (isset($context['existingChallenges']) && !empty($context['existingChallenges'])) {
                $promptBase .= "\n\nPrevious challenges in this game:\n";
                foreach ($context['existingChallenges'] as $challenge) {
                    $promptBase .= "- {$challenge['type']} challenge: {$challenge['title']}\n";
                    $promptBase .= "  Content: {$challenge['content']}\n";
                }
            }

            // Add specific word count requirements for different types of descriptions
            if ($data['field'] === 'description') {
                $promptBase .= "\nThis is a game description that should be between 15-50 words long, providing an engaging overview of what players will find or experience.\n";
            } elseif ($data['field'] === 'story') {
                $promptBase .= "\nThis is a story-type challenge description that should be a detailed narrative block (50-100 words) telling an engaging story.\n";
            } elseif ($data['field'] === 'travel') {
                $promptBase .= "\nThis is a travel-type challenge description that should be a riddle or medium-length text (20-40 words) guiding players to a location.\n";
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

            // Process the response
            if ($response === false) {
                throw new Exception('Failed to get response from Anthropic API: ' . curl_error($ch));
            }

            $responseData = json_decode($response, true);
            debug_log("Decoded Anthropic response:", $responseData);

            if (!isset($responseData['content'][0]['text'])) {
                throw new Exception('Invalid response format from Anthropic API');
            }

            // Extract and parse the suggestions
            $text = $responseData['content'][0]['text'];
            
            // Find the JSON array in the response
            if (preg_match('/\[.*\]/s', $text, $matches)) {
                $suggestionsJson = $matches[0];
                $suggestions = json_decode($suggestionsJson, true);
                
                if (!is_array($suggestions)) {
                    throw new Exception('Failed to parse AI response as JSON array');
                }

                // Ensure we have the correct number of suggestions
                $suggestions = array_slice($suggestions, 0, $responseCount);

                echo json_encode([
                    'status' => 'success',
                    'data' => [
                        'suggestions' => array_map(
                            function($item) { 
                                return isset($item['content']) ? $item['content'] : strval($item); 
                            },
                            $suggestions
                        )
                    ],
                    'message' => 'Successfully generated suggestions'
                ]);
            } else {
                throw new Exception('Failed to find JSON array in AI response');
            }

            curl_close($ch);

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
