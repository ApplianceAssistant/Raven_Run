<?php
require_once (__DIR__ . '/../../utils/db_connection.php');
require_once (__DIR__ . '/../../utils/encryption.php');
require_once (__DIR__ . '/../../utils/errorHandler.php');
require_once (__DIR__ . '/../auth/auth.php');

// Set content type to JSON
header('Content-Type: application/json');

try {
    $conn = getDbConnection();
    if (!$conn) {
        error_log("Database connection failed");
        throw new Exception("Failed to connect to database");
    }
        
    // Handle different API endpoints
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';

    // Skip authentication for public endpoints
    $skipAuth = false;
    if ($method === 'GET' && $action === 'public_games') {
        $skipAuth = true;
    }

    // Authenticate user for protected routes
    if (!$skipAuth) {
        $user = authenticateUser();
        if (!$user) {
            http_response_code(401);
            handleError(401, 'Unauthorized access', __FILE__, __LINE__);
            exit;
        }
    }

    switch ($method) {
        case 'GET':
            if ($action === 'check_gameId') {
                $gameId = $_GET['gameId'] ?? '';
                $stmt = $conn->prepare("SELECT COUNT(*) as count FROM games WHERE gameId = ?");
                $stmt->bind_param("s", $gameId);
                $stmt->execute();
                $result = $stmt->get_result();
                $count = $result->fetch_assoc()['count'];
                echo json_encode(["isUnique" => $count == 0]);
            } elseif ($action === 'public_games') {
                // Get all public games
                $query = "
                    SELECT 
                        g.gameId as id,
                        g.name as title,
                        g.description,
                        g.created_at,
                        u.username as creator_name
                    FROM games g
                    JOIN users u ON g.user_id = u.id
                    WHERE g.is_public = 1
                    ORDER BY g.created_at DESC
                ";
                                
                $result = $conn->query($query);
                if (!$result) {
                    error_log("Query failed: " . $conn->error);
                    throw new Exception("Failed to fetch public games: " . $conn->error);
                }
                
                $games = [];
                
                while ($game = $result->fetch_assoc()) {
                    
                    // Check if challenges table exists
                    $tableCheckQuery = "SHOW TABLES LIKE 'challenges'";
                    $tableExists = $conn->query($tableCheckQuery)->num_rows > 0;
                    
                    if ($tableExists) {
                        $challengeQuery = "
                            SELECT * FROM challenges 
                            WHERE game_id = ? 
                            ORDER BY order_index
                        ";
                        $stmt = $conn->prepare($challengeQuery);
                        if (!$stmt) {
                            error_log("Failed to prepare challenge query: " . $conn->error);
                            throw new Exception("Failed to prepare challenge query: " . $conn->error);
                        }
                        
                        $stmt->bind_param('s', $game['id']);
                        if (!$stmt->execute()) {
                            error_log("Failed to execute challenge query: " . $stmt->error);
                            throw new Exception("Failed to execute challenge query: " . $stmt->error);
                        }
                        
                        $challengeResult = $stmt->get_result();
                        
                        $challenges = [];
                        while ($challenge = $challengeResult->fetch_assoc()) {
                            $challenge['content'] = json_decode($challenge['content'], true);
                            $challenges[] = $challenge;
                        }
                        
                        $game['challenges'] = $challenges;
                        $stmt->close();
                    } else {
                        // If challenges table doesn't exist, just set an empty array
                        $game['challenges'] = [];
                    }
                    
                    $games[] = $game;
                }
                
                echo json_encode(['status' => 'success', 'data' => $games]);
            } elseif ($action === 'get_games') {
                // Get all games for the authenticated user
                $stmt = $conn->prepare("SELECT gameId, name, description, challenge_data, is_public FROM games WHERE user_id = ?");
                $stmt->bind_param("i", $user['id']);
                $stmt->execute();
                $result = $stmt->get_result();
                $games = $result->fetch_all(MYSQLI_ASSOC);
                echo json_encode($games);
            } elseif ($action === 'get' && isset($_GET['gameId'])) {
                $gameId = $_GET['gameId'];
                $stmt = $conn->prepare("SELECT gameId, name, description, challenge_data, is_public FROM games WHERE gameId = ? AND (user_id = ? OR is_public = 1)");
                $stmt->bind_param("si", $gameId, $user['id']);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($game = $result->fetch_assoc()) {
                    echo json_encode($game);
                } else {
                    http_response_code(404);
                    echo json_encode(["error" => "Game not found or access denied"]);
                }
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
                $name = $game['name'];
                $description = $game['description'];
                $isPublic = $game['is_public'] ? 1 : 0;
                $challengeData = json_encode($game['challenges']);

                // Create default POINT for locations if not provided
                $startLocation = 'POINT(0 0)';
                $endLocation = 'POINT(0 0)';

                // If start_location is provided, create POINT from coordinates
                if (isset($game['start_location']) && 
                    isset($game['start_location']['coordinates']) && 
                    is_array($game['start_location']['coordinates']) && 
                    count($game['start_location']['coordinates']) === 2) {
                    $startLocation = sprintf(
                        'POINT(%f %f)', 
                        $game['start_location']['coordinates'][0],
                        $game['start_location']['coordinates'][1]
                    );
                }

                // If end_location is provided, create POINT from coordinates
                if (isset($game['end_location']) && 
                    isset($game['end_location']['coordinates']) && 
                    is_array($game['end_location']['coordinates']) && 
                    count($game['end_location']['coordinates']) === 2) {
                    $endLocation = sprintf(
                        'POINT(%f %f)', 
                        $game['end_location']['coordinates'][0],
                        $game['end_location']['coordinates'][1]
                    );
                }

                // Check if the game already exists
                $stmt = $conn->prepare("SELECT user_id FROM games WHERE gameId = ?");
                $stmt->bind_param("s", $gameId);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    // Game exists, update it
                    $stmt = $conn->prepare(
                        "UPDATE games 
                        SET name = ?, 
                            description = ?, 
                            is_public = ?, 
                            challenge_data = ?,
                            start_location = ST_GeomFromText(?),
                            end_location = ST_GeomFromText(?)
                        WHERE gameId = ?"
                    );
                    $stmt->bind_param("ssissss", $name, $description, $isPublic, $challengeData, $startLocation, $endLocation, $gameId);
                } else {
                    // Insert new game
                    $stmt = $conn->prepare(
                        "INSERT INTO games 
                        (gameId, user_id, name, description, is_public, challenge_data, start_location, end_location) 
                        VALUES (?, ?, ?, ?, ?, ?, ST_GeomFromText(?), ST_GeomFromText(?))"
                    );
                    $stmt->bind_param("sisssiss", $gameId, $user['id'], $name, $description, $isPublic, $challengeData, $startLocation, $endLocation);
                }

                if ($stmt->execute()) {
                    echo json_encode([
                        "gameId" => $gameId,
                        "message" => "Game saved successfully"
                    ]);
                } else {
                    http_response_code(500);
                    error_log("Failed to save game: " . $stmt->error);
                    echo json_encode(["error" => "Failed to save game"]);
                }
            } elseif ($action === 'delete_game') {
                $gameId = $data['gameId'] ?? '';
                if (empty($gameId)) {
                    http_response_code(400);
                    echo json_encode(["error" => "Game ID is required"]);
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
                    echo json_encode(["message" => "Game deleted successfully"]);
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
} finally {
    // Release the connection but don't close it
    releaseDbConnection();
}