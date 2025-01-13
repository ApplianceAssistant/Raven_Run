<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once (__DIR__ . '/../../utils/db_connection.php');
require_once (__DIR__ . '/../../utils/encryption.php');
require_once (__DIR__ . '/../../utils/errorHandler.php');
require_once (__DIR__ . '/../auth/auth.php');
require_once (__DIR__ . '/../../utils/unitConversion.php');

ini_set('default_charset', 'UTF-8');
mb_internal_encoding('UTF-8');

// Set content type to JSON with UTF-8
header('Content-Type: application/json; charset=utf-8');

// Handle CORS for both local and staging
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    }
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }
    exit(0);
}

// Get database connection
try {
    $conn = getDbConnection();
    if (!$conn) {
        error_log("Database connection failed");
        http_response_code(500);
        echo json_encode([
            "error" => "Unable to connect to the service. Please try again later.",
            "status" => "error"
        ]);
        handleError(500, 'Failed to connect to database', __FILE__, __LINE__);
        exit;
    }
        
    // Handle different API endpoints
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';

    // Skip authentication for public endpoints
    $skipAuth = false;
    if ($method === 'GET' && ($action === 'public_games' || $action === 'get')) {
        $skipAuth = true;
    }

    // Authenticate user for protected routes
    if (!$skipAuth) {
        $user = authenticateUser();
        if (!$user) {
            http_response_code(401);
            echo json_encode([
                "error" => "You must be logged in to perform this action.",
                "status" => "error"
            ]);
            handleError(401, 'Authentication failed', __FILE__, __LINE__);
            exit;
        }
    }

    // Get unit preference from request headers or query params
    $isMetric = isset($_SERVER['HTTP_X_UNIT_SYSTEM']) ? 
        $_SERVER['HTTP_X_UNIT_SYSTEM'] === 'metric' : 
        (isset($_GET['unit_system']) ? $_GET['unit_system'] === 'metric' : true);

    switch ($method) {
        case 'GET':
            if ($action === 'public_games') {
                error_log("Fetching public games");
                // Get all public games
                $stmt = $conn->prepare("
                    SELECT 
                        g.gameId,
                        g.title,
                        g.description,
                        g.challenge_data,
                        g.is_public,
                        g.created_at,
                        g.updated_at,
                        g.user_id,
                        g.difficulty_level,
                        g.distance,
                        g.estimated_time,
                        g.tags,
                        g.dayOnly,
                        g.avg_rating,
                        g.rating_count,
                        g.start_latitude,
                        g.start_longitude,
                        u.username as creator_name
                    FROM games g
                    LEFT JOIN users u ON g.user_id = u.id
                    WHERE g.is_public = 1
                ");
                
                if (!$stmt) {
                    error_log("Failed to prepare statement: " . $conn->error);
                    http_response_code(500);
                    echo json_encode([
                        "status" => "error",
                        "message" => "Database error",
                        "debug" => "Failed to prepare statement"
                    ]);
                    exit;
                }
                
                if (!$stmt->execute()) {
                    error_log("Failed to execute statement: " . $stmt->error);
                    http_response_code(500);
                    echo json_encode([
                        "status" => "error",
                        "message" => "Database error",
                        "debug" => "Failed to execute statement"
                    ]);
                    exit;
                }

                $result = $stmt->get_result();
                error_log("Found " . $result->num_rows . " public games");
                
                $games = [];
                while ($row = $result->fetch_assoc()) {
                    try {
                        // Convert radius values in challenges to display units
                        $challenge_data = $row['challenge_data'];
                        error_log("Processing game " . $row['gameId'] . " challenge data: " . substr($challenge_data, 0, 100) . "...");
                        
                        $challenges = json_decode($challenge_data, true);
                        if (json_last_error() !== JSON_ERROR_NONE) {
                            error_log("JSON decode error for game " . $row['gameId'] . ": " . json_last_error_msg());
                            continue;
                        }
                        
                        foreach ($challenges as &$challenge) {
                            if (isset($challenge['radius'])) {
                                $challenge['radius'] = convertRadius($challenge['radius'], $isMetric, false);
                            }
                        }
                        
                        // Format the game data
                        $games[] = [
                            'id' => $row['gameId'],
                            'title' => $row['title'],
                            'description' => $row['description'],
                            'challenges' => $challenges,
                            'isPublic' => (bool)$row['is_public'],
                            'createdAt' => $row['created_at'],
                            'updatedAt' => $row['updated_at'],
                            'userId' => $row['user_id'],
                            'difficulty' => $row['difficulty_level'],
                            'distance' => (float)$row['distance'],
                            'estimatedTime' => (int)$row['estimated_time'],
                            'tags' => $row['tags'] !== null ? json_decode($row['tags'], true) : [],
                            'dayOnly' => (bool)$row['dayOnly'],
                            'avg_rating' => (float)$row['avg_rating'],
                            'rating_count' => (int)$row['rating_count'],
                            'startLocation' => [
                                'latitude' => (float)$row['start_latitude'],
                                'longitude' => (float)$row['start_longitude']
                            ],
                            'creator_name' => $row['creator_name']
                        ];
                    } catch (Exception $e) {
                        error_log("Error processing game " . $row['gameId'] . ": " . $e->getMessage());
                        continue;
                    }
                }
                
                error_log("Successfully processed " . count($games) . " games");
                
                array_walk_recursive($games, function(&$item) {
                    if (is_string($item)) {
                        // Convert to UTF-8 and remove invalid characters
                        $item = mb_convert_encoding($item, 'UTF-8', 'UTF-8');
                        $item = preg_replace('/[\x00-\x1F\x7F-\xFF]/u', '', $item);
                    }
                });

                $response = ['status' => 'success', 'data' => $games];
                
                // Clear any previous output
                if (ob_get_length()) ob_clean();
                
                // Ensure headers are set
                header('Content-Type: application/json; charset=utf-8');
                
                // Send response and exit
                echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
                exit;

            } elseif ($action === 'get' && isset($_GET['gameId'])) {
                $gameId = $_GET['gameId'];
                error_log("Fetching game with ID: " . $gameId);
                
                // Modified query to get game data for public games without requiring user authentication
                $stmt = $conn->prepare("
                    SELECT 
                        g.gameId,
                        g.title,
                        g.description,
                        g.challenge_data,
                        g.is_public,
                        g.start_latitude,
                        g.start_longitude,
                        g.end_latitude,
                        g.end_longitude,
                        g.distance,
                        g.difficulty_level,
                        g.estimated_time,
                        g.tags,
                        g.dayOnly,
                        u.username as creator_name
                    FROM games g
                    LEFT JOIN users u ON g.user_id = u.id
                    WHERE g.gameId = ? AND g.is_public = 1
                ");
                
                if (!$stmt) {
                    error_log("Failed to prepare statement: " . $conn->error);
                    http_response_code(500);
                    echo json_encode([
                        "status" => "error",
                        "message" => "Database error",
                        "debug" => "Failed to prepare statement"
                    ]);
                    exit;
                }

                $stmt->bind_param("s", $gameId);
                
                if (!$stmt->execute()) {
                    error_log("Failed to execute statement: " . $stmt->error);
                    http_response_code(500);
                    echo json_encode([
                        "status" => "error",
                        "message" => "Database error",
                        "debug" => "Failed to execute statement"
                    ]);
                    exit;
                }

                $result = $stmt->get_result();
                if ($game = $result->fetch_assoc()) {
                    error_log("Game found, processing data");
                    // Format the game data consistently with public_games endpoint
                    $formattedGame = [
                        'id' => $game['gameId'],
                        'title' => $game['title'],
                        'description' => $game['description'],
                        'challenges' => json_decode($game['challenge_data'], true),
                        'isPublic' => (bool)$game['is_public'],
                        'difficulty' => $game['difficulty_level'],
                        'distance' => (float)$game['distance'],
                        'estimatedTime' => (int)$game['estimated_time'],
                        'tags' => $game['tags'] !== null ? json_decode($game['tags'], true) : [],
                        'dayOnly' => (bool)$game['dayOnly'],
                        'startLocation' => [
                            'latitude' => (float)$game['start_latitude'],
                            'longitude' => (float)$game['start_longitude']
                        ],
                        'creator_name' => $game['creator_name']
                    ];
                    error_log("Successfully processed game data" . json_encode($formattedGame));
                    
                    // Clear any previous output
                    if (ob_get_length()) ob_clean();
                    
                    // Ensure headers are set
                    header('Content-Type: application/json; charset=utf-8');
                    
                    // Send response and exit
                    echo json_encode($formattedGame);
                    exit;
                } else {
                    error_log("Game not found with ID: " . $gameId);
                    http_response_code(404);
                    
                    // Clear any previous output
                    if (ob_get_length()) ob_clean();
                    
                    // Ensure headers are set
                    header('Content-Type: application/json; charset=utf-8');
                    
                    // Send error response and exit
                    echo json_encode([
                        "status" => "error",
                        "message" => "Game not found or is not public"
                    ]);
                    exit;
                }
            } elseif ($action === 'get_games') {
                error_log("Fetching games for user ID: " . $user['id']);
                
                if (!isset($user['id'])) {
                    error_log("User ID not set in get_games");
                    http_response_code(400);
                    echo json_encode([
                        "error" => "User ID not set",
                        "status" => "error"
                    ]);
                    exit;
                }
                
                // Get all games for the authenticated user
                $stmt = $conn->prepare("
                    SELECT 
                        gameId,
                        title,
                        description,
                        challenge_data,
                        is_public,
                        created_at,
                        updated_at,
                        user_id,
                        difficulty_level,
                        distance,
                        estimated_time,
                        tags,
                        dayOnly,
                        avg_rating,
                        rating_count,
                        start_latitude,
                        start_longitude,
                        end_latitude,
                        end_longitude
                    FROM games 
                    WHERE user_id = ?
                ");
                
                if (!$stmt) {
                    error_log("Failed to prepare statement: " . $conn->error);
                    http_response_code(500);
                    echo json_encode([
                        "error" => "Database error",
                        "message" => "Failed to prepare statement",
                        "status" => "error"
                    ]);
                    handleError(500, "Database error: Failed to prepare statement" . $conn->error, __FILE__, __LINE__);
                    exit;
                }

                $stmt->bind_param("i", $user['id']);
                
                if (!$stmt->execute()) {
                    error_log("Failed to execute statement: " . $stmt->error);
                    http_response_code(500);
                    echo json_encode([
                        "error" => "Database error",
                        "message" => "Failed to execute query",
                        "status" => "error"
                    ]);
                    handleError(500, "Database error: Failed to execute query" . $stmt->error, __FILE__, __LINE__);
                    exit;
                }

                $result = $stmt->get_result();
                $games = [];
                
                error_log("Found " . $result->num_rows . " games");
                
                if ($result->num_rows === 0) {
                    error_log("No games found for user " . $user['id']);
                    echo json_encode([]);
                    exit;
                }
                
                while ($row = $result->fetch_assoc()) {
                    try {
                        error_log("Processing game ID: " . $row['gameId']);
                        
                        // Convert radius values in challenges to display units
                        $challenge_data = $row['challenge_data'];
                        error_log("Processing challenge data: " . substr($challenge_data, 0, 100) . "...");
                        
                        $challenges = json_decode($challenge_data, true);
                        if (json_last_error() !== JSON_ERROR_NONE) {
                            error_log("JSON decode error for game " . $row['gameId'] . ": " . json_last_error_msg());
                            continue;
                        }

                        foreach ($challenges as &$challenge) {
                            if (isset($challenge['radius'])) {
                                $challenge['radius'] = convertRadius($challenge['radius'], $isMetric, false);
                            }
                        }
                        
                        // Format the game data
                        $games[] = [
                            'id' => $row['gameId'],
                            'title' => $row['title'],
                            'description' => $row['description'],
                            'challenges' => $challenges,
                            'isPublic' => (bool)$row['is_public'],
                            'createdAt' => $row['created_at'],
                            'updatedAt' => $row['updated_at'],
                            'userId' => $row['user_id'],
                            'difficulty' => $row['difficulty_level'],
                            'distance' => (float)$row['distance'],
                            'estimatedTime' => (int)$row['estimated_time'],
                            'tags' => $row['tags'] !== null ? json_decode($row['tags'], true) : [],
                            'dayOnly' => (bool)$row['dayOnly'],
                            'avg_rating' => (float)$row['avg_rating'],
                            'rating_count' => (int)$row['rating_count'],
                            'startLocation' => [
                                'latitude' => (float)$row['start_latitude'],
                                'longitude' => (float)$row['start_longitude']
                            ],
                            'endLocation' => [
                                'latitude' => (float)$row['end_latitude'],
                                'longitude' => (float)$row['end_longitude']
                            ]
                        ];
                    } catch (Exception $e) {
                        error_log("Error processing game " . $row['gameId'] . ": " . $e->getMessage());
                        continue;
                    }
                }
                
                handleError(200, "Successfully processed " . count($games) . " games", __FILE__, __LINE__);
                
                // Ensure headers are set correctly
                header('Content-Type: application/json; charset=utf-8');
                
                // Clear any previous output
                if (ob_get_length()) ob_clean();
                
                // Send the response and exit
                echo json_encode($games);
                exit;
            } else {
                http_response_code(400);
                echo json_encode(["error" => "Invalid action"]);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $action = $data['action'] ?? '';

            if ($action === 'save_game') {
                error_log("Saving game");
                $game = $data['game'];
                $gameId = $game['gameId'];
                $title = $game['title'];
                $description = $game['description'];
                $isPublic = $game['is_public'] ? 1 : 0;
                $challengeData = json_encode($game['challenges']);

                // Initialize location variables
                $startLat = null;
                $startLong = null;
                $endLat = null;
                $endLong = null;
                $distance = null;

                // Get travel challenges and sort by order
                $challenges = json_decode($challengeData, true);
                $locationChallenges = array_filter($challenges, function($challenge) {
                    return isset($challenge['targetLocation']);
                });
                
                if (!empty($locationChallenges)) {
                    usort($locationChallenges, function($a, $b) {
                        return ($a['order'] ?? 0) - ($b['order'] ?? 0);
                    });
                    
                    // Set start location from first travel challenge
                    $firstChallenge = reset($locationChallenges);
                    if (isset($firstChallenge['targetLocation'])) {
                        $startLat = $firstChallenge['targetLocation']['latitude'];
                        $startLong = $firstChallenge['targetLocation']['longitude'];
                    }
                    
                    // Set end location from last travel challenge
                    $lastChallenge = end($locationChallenges);
                    if (isset($lastChallenge['targetLocation'])) {
                        $endLat = $lastChallenge['targetLocation']['latitude'];
                        $endLong = $lastChallenge['targetLocation']['longitude'];
                    }
                    
                    // Calculate total distance in kilometers
                    if (count($locationChallenges) >= 2) {
                        $totalDistance = 0;
                        $prevLocation = null;
                        foreach ($locationChallenges as $challenge) {
                            $currentLocation = $challenge['targetLocation'];
                            if ($prevLocation) {
                                // Cast coordinates to float and calculate using Haversine formula
                                $lat1 = deg2rad((float)$prevLocation['latitude']);
                                $lon1 = deg2rad((float)$prevLocation['longitude']);
                                $lat2 = deg2rad((float)$currentLocation['latitude']);
                                $lon2 = deg2rad((float)$currentLocation['longitude']);
                                
                                $dlat = $lat2 - $lat1;
                                $dlon = $lon2 - $lon1;
                                
                                $a = sin($dlat/2) * sin($dlat/2) +
                                     cos($lat1) * cos($lat2) *
                                     sin($dlon/2) * sin($dlon/2);
                                $c = 2 * atan2(sqrt($a), sqrt(1-$a));
                                
                                // 6371 is Earth's radius in kilometers
                                $totalDistance += 6371 * $c;
                            }
                            $prevLocation = $currentLocation;
                        }
                        $distance = $totalDistance;
                    }
                }

                // Get challenges and process them
                $challenges = json_decode($challengeData, true);
                foreach ($challenges as &$challenge) {
                    if (isset($challenge['radius'])) {
                        // Convert radius to meters for storage
                        $challenge['radius'] = convertRadius($challenge['radius'], $isMetric, true);
                    }
                }
                $challengeData = json_encode($challenges);

                // Check if the game already exists
                $stmt = $conn->prepare("SELECT user_id FROM games WHERE gameId = ?");
                $stmt->bind_param("s", $gameId);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    // Game exists, update it
                    $stmt = $conn->prepare(
                        "UPDATE games 
                        SET title = ?, 
                            description = ?, 
                            is_public = ?, 
                            challenge_data = ?,
                            start_latitude = ?,
                            start_longitude = ?,
                            end_latitude = ?,
                            end_longitude = ?,
                            distance = ?
                        WHERE gameId = ?"
                    );
                    $stmt->bind_param("ssissdddds", 
                        $title, 
                        $description, 
                        $isPublic, 
                        $challengeData, 
                        $startLat,
                        $startLong,
                        $endLat,
                        $endLong,
                        $distance,
                        $gameId
                    );
                } else {
                    // Insert new game
                    $stmt = $conn->prepare(
                        "INSERT INTO games 
                        (gameId, user_id, title, description, is_public, challenge_data, 
                         start_latitude, start_longitude, end_latitude, end_longitude, distance) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                    );
                    $stmt->bind_param("sisssisdddds", 
                        $gameId, 
                        $user['id'], 
                        $title, 
                        $description, 
                        $isPublic, 
                        $challengeData,
                        $startLat,
                        $startLong,
                        $endLat,
                        $endLong,
                        $distance
                    );
                }

                if ($stmt->execute()) {
                    error_log("Game saved successfully");
                    
                    // Clear any previous output
                    if (ob_get_length()) ob_clean();
                    
                    // Ensure headers are set
                    header('Content-Type: application/json; charset=utf-8');
                    
                    // Send success response and exit
                    echo json_encode([
                        "gameId" => $gameId,
                        "message" => "Game saved successfully",
                        "status" => "success"
                    ]);
                    exit;
                } else {
                    http_response_code(500);
                    error_log("Failed to save game: " . $stmt->error);
                    echo json_encode([
                        "error" => "Unable to save your game at this time. Please try again later.",
                        "status" => "error"
                    ]);
                    exit;
                }
            } elseif ($action === 'delete_game') {
                $gameId = $data['gameId'] ?? '';
                if (empty($gameId)) {
                    http_response_code(400);
                    error_log("Game ID is required for deletion");
                    echo json_encode([
                        "error" => "Unable to delete the game. Please try again.",
                        "status" => "error"
                    ]);
                    exit;
                }

                // Check if the game belongs to the current user
                $stmt = $conn->prepare("SELECT user_id FROM games WHERE gameId = ?");
                $stmt->bind_param("s", $gameId);
                $stmt->execute();
                $result = $stmt->get_result();
                
                if ($result->num_rows === 0) {
                    http_response_code(404);
                    error_log("Game not found");
                    echo json_encode(["error" => "Game not found"]);
                    exit;
                }

                $game = $result->fetch_assoc();
                if ($game['user_id'] != $user['id']) {
                    http_response_code(403);
                    error_log("Access denied");
                    echo json_encode(["error" => "You don't have permission to delete this game"]);
                    exit;
                }

                // Delete the game
                $stmt = $conn->prepare("DELETE FROM games WHERE gameId = ?");
                $stmt->bind_param("s", $gameId);
                
                if ($stmt->execute()) {
                    error_log("Game deleted successfully");
                    
                    // Clear any previous output
                    if (ob_get_length()) ob_clean();
                    
                    // Ensure headers are set
                    header('Content-Type: application/json; charset=utf-8');
                    
                    // Send success response and exit
                    echo json_encode([
                        "status" => "success",
                        "message" => "Game deleted successfully"
                    ]);
                    exit;
                } else {
                    http_response_code(500);
                    error_log("Failed to delete game: " . $stmt->error);
                    echo json_encode(["error" => "Failed to delete game"]);
                }
            } else {
                http_response_code(400);
                error_log("Invalid action");
                echo json_encode(["error" => "Invalid action"]);
            }
            break;

        default:
            http_response_code(405);
            error_log("Method not allowed");
            echo json_encode(["error" => "Method not allowed"]);
            break;
    }

} catch (Exception $e) {
    http_response_code(500);
    error_log("Exception caught: " . $e->getMessage());
    handleError($e->getCode(), $e->getMessage(), __FILE__, __LINE__);
    
    // Return a generic error message to the user
    echo json_encode([
        "error" => "An unexpected error occurred while processing your request. Please try again later.",
        "status" => "error"
    ]);
} finally {
    // Release the connection but don't close it
    releaseDbConnection();
}