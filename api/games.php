<?php

require_once (__DIR__ . '/../server/db_connection.php');
require_once (__DIR__ . '/../server/encryption.php');
require_once (__DIR__ . '/errorHandler.php');
require_once (__DIR__ . '/auth.php');

// Set content type to JSON
header('Content-Type: application/json');

try {
    // Ensure the request is coming from an authenticated user
    $user = authenticateUser();
    error_log("User: " . print_r($user, true));
    if (!$user) {
        http_response_code(401);
        handleError(401, 'Unauthorized access', __FILE__, __LINE__);
        exit;
    }

    $conn = getDbConnection();
    if (!$conn) {
        throw new Exception("Failed to connect to database");
    }
    
    // Handle different API endpoints
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';

    switch ($method) {
        case 'GET':
            if ($action === 'check_game_id') {
                $gameId = $_GET['game_id'] ?? '';
                $stmt = $conn->prepare("SELECT COUNT(*) as count FROM games WHERE game_id = ?");
                $stmt->bind_param("s", $gameId);
                $stmt->execute();
                $result = $stmt->get_result();
                $count = $result->fetch_assoc()['count'];
                echo json_encode(["isUnique" => $count == 0]);
            } elseif ($action === 'get_games') {
                
                // Get all games for the authenticated user
                $stmt = $conn->prepare("SELECT game_id, name, description, challenge_data, is_public FROM games WHERE user_id = ?");
                $stmt->bind_param("i", $user['id']);
                $stmt->execute();
                $result = $stmt->get_result();
                $games = $result->fetch_all(MYSQLI_ASSOC);
                echo json_encode($games);
            } elseif ($action === 'get' && isset($_GET['game_id'])) {
                $gameId = $_GET['game_id'];
                $stmt = $conn->prepare("SELECT game_id, name, description, challenge_data, is_public FROM games WHERE game_id = ? AND (user_id = ? OR is_public = 1)");
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
                $game = $data['game'];
                $gameId = $game['game_id'];
                $name = $game['name'];
                $description = $game['description'];
                $isPublic = $game['is_public'] ? 1 : 0;
                $challengeData = json_encode($game['challenges']);

                // Check if the game already exists
                $stmt = $conn->prepare("SELECT user_id FROM games WHERE game_id = ?");
                $stmt->bind_param("s", $gameId);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    // Game exists, update it
                    $stmt = $conn->prepare("UPDATE games SET name = ?, description = ?, is_public = ?, challenge_data = ? WHERE game_id = ?");
                    $stmt->bind_param("ssiss", $name, $description, $isPublic, $challengeData, $gameId);
                } else {
                    // Insert new game
                    $stmt = $conn->prepare("INSERT INTO games (game_id, user_id, name, description, is_public, challenge_data) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt->bind_param("sisssi", $gameId, $user['id'], $name, $description, $isPublic, $challengeData);
                }

                if ($stmt->execute()) {
                    echo json_encode([
                        "game_id" => $gameId,
                        "message" => "Game saved successfully"
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode(["error" => "Failed to save game"]);
                }
            } elseif ($action === 'delete_game') {
                $gameId = $data['game_id'] ?? '';
                if (empty($gameId)) {
                    http_response_code(400);
                    echo json_encode(["error" => "Game ID is required"]);
                    exit;
                }

                // Check if the game belongs to the current user
                $stmt = $conn->prepare("SELECT user_id FROM games WHERE game_id = ?");
                $stmt->bind_param("s", $gameId);
                $stmt->execute();
                $result = $stmt->get_result();
                
                if ($result->num_rows === 0) {
                    http_response_code(404);
                    echo json_encode(["error" => "Game not found"]);
                    exit;
                }

                $game = $result->fetch_assoc();
                if ($game['user_id'] != $user['id']) {
                    http_response_code(403);
                    echo json_encode(["error" => "You don't have permission to delete this game"]);
                    exit;
                }

                // Delete the game
                $stmt = $conn->prepare("DELETE FROM games WHERE game_id = ?");
                $stmt->bind_param("s", $gameId);
                
                if ($stmt->execute()) {
                    echo json_encode(["message" => "Game deleted successfully"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["error" => "Failed to delete game"]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["error" => "Invalid action"]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
            break;
    }

} catch (Exception $e) {
    http_response_code(500);
    handleError($e->getCode(), $e->getMessage(), __FILE__, __LINE__);
} finally {
    // Release the connection but don't close it
    releaseDbConnection();
}