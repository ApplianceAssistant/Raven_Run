<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once (__DIR__ . '/../../utils/db_connection.php');
require_once (__DIR__ . '/../../utils/encryption.php');
require_once (__DIR__ . '/../../utils/errorHandler.php');
require_once (__DIR__ . '/../../auth/auth.php');

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
            'status' => 'error',
            'message' => 'Database connection failed'
        ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
        exit(0);
    }

    // Get authenticated user
    $user = authenticateUser($conn);
    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'Authentication required'
        ]);
        exit;
    }

    // Handle different API endpoints
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            $action = $_GET['action'] ?? '';
            
            if ($action === 'get_ratings') {
                // Get ratings for a specific game
                if (!isset($_GET['gameId'])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Game ID is required'
                    ]);
                    exit;
                }

                $gameId = $_GET['gameId'];
                $stmt = $conn->prepare("
                    SELECT r.*, u.username 
                    FROM game_ratings r 
                    JOIN users u ON r.userId = u.id 
                    WHERE r.gameId = ?
                    ORDER BY r.created_at DESC
                ");
                $stmt->bind_param("s", $gameId);
                
                if ($stmt->execute()) {
                    $result = $stmt->get_result();
                    $ratings = [];
                    while ($row = $result->fetch_assoc()) {
                        $ratings[] = $row;
                    }
                    echo json_encode([
                        'success' => true,
                        'ratings' => $ratings
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Failed to fetch ratings'
                    ]);
                }
            } else {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid action'
                ]);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $action = $data['action'] ?? '';

            if ($action === 'rate') {
                if (!isset($data['gameId'], $data['rating'])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Missing required fields'
                    ]);
                    exit;
                }

                $gameId = $data['gameId'];
                $userId = $user['id'];
                $rating = $data['rating'];
                $review = $data['review'] ?? null;
                $suggestedDifficulty = $data['suggestedDifficulty'] ?? null;

                // Check if user has already rated this game
                $checkStmt = $conn->prepare("SELECT id FROM game_ratings WHERE gameId = ? AND userId = ?");
                $checkStmt->bind_param("si", $gameId, $userId);
                $checkStmt->execute();
                $result = $checkStmt->get_result();

                if ($result->num_rows > 0) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'You have already rated this game'
                    ]);
                    exit;
                }

                // Start transaction
                $conn->begin_transaction();

                try {
                    // Insert the rating
                    $stmt = $conn->prepare("INSERT INTO game_ratings (gameId, userId, rating, review) VALUES (?, ?, ?, ?)");
                    $stmt->bind_param("siis", $gameId, $userId, $rating, $review);
                    $stmt->execute();

                    // If a difficulty suggestion was provided, update the game's difficulty
                    if ($suggestedDifficulty) {
                        $updateStmt = $conn->prepare("UPDATE games SET difficulty_level = ? WHERE gameId = ?");
                        $updateStmt->bind_param("ss", $suggestedDifficulty, $gameId);
                        $updateStmt->execute();
                    }

                    $conn->commit();
                    echo json_encode([
                        'success' => true,
                        'message' => 'Rating submitted successfully'
                    ]);
                } catch (Exception $e) {
                    $conn->rollback();
                    http_response_code(500);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Failed to submit rating'
                    ]);
                    handleError($e->getCode(), $e->getMessage(), __FILE__, __LINE__);
                }
            } elseif ($action === 'report_bug') {
                if (!isset($data['gameId'], $data['description'])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Missing required fields for bug report'
                    ]);
                    exit;
                }

                $gameId = $data['gameId'];
                $userId = $user['id'];
                $description = $data['description'];

                $stmt = $conn->prepare("INSERT INTO bug_reports (gameId, userId, description) VALUES (?, ?, ?)");
                $stmt->bind_param("sis", $gameId, $userId, $description);
                
                if ($stmt->execute()) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Bug report submitted successfully'
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Failed to submit bug report'
                    ]);
                }
            } else {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid action'
                ]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode([
                'status' => 'error',
                'message' => 'Method not allowed'
            ]);
            break;
    }

} catch (Exception $e) {
    http_response_code(500);
    error_log("Exception caught: " . $e->getMessage());
    handleError($e->getCode(), $e->getMessage(), __FILE__, __LINE__);
    
    echo json_encode([
        'status' => 'error',
        'message' => 'An error occurred while processing your request'
    ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
}

$conn->close();
