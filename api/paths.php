<?php

require_once (__DIR__ . '/../server/db_connection.php');
require_once (__DIR__ . '/../server/encryption.php');
require_once (__DIR__ . '/errorHandler.php');
require_once (__DIR__ . '/auth.php');

// Set content type to JSON
header('Content-Type: application/json');

// Ensure the request is coming from an authenticated user
try {
    $conn = getDbConnection();
    // Handle different API endpoints
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';

    switch ($method) {
        case 'GET':
            if ($action === 'check_path_id') {
                $pathId = $_GET['path_id'] ?? '';
                $stmt = $conn->prepare("SELECT COUNT(*) as count FROM paths WHERE path_id = ?");
                $stmt->bind_param("s", $pathId);
                $stmt->execute();
                $result = $stmt->get_result();
                $count = $result->fetch_assoc()['count'];
                echo json_encode(["isUnique" => $count == 0]);
            } elseif ($action === 'get_games') {
                // Get all games for the authenticated user
                $stmt = $conn->prepare("SELECT path_id, name, description, challenge_data, is_public FROM paths WHERE user_id = ?");
                $stmt->bind_param("i", $user['id']);
                $stmt->execute();
                $result = $stmt->get_result();
                $games = $result->fetch_all(MYSQLI_ASSOC);
                echo json_encode($games);
            } elseif ($action === 'get' && isset($_GET['path_id'])) {
                $pathId = $_GET['path_id'];
                $stmt = $conn->prepare("SELECT path_id, name, description, challenge_data, is_public FROM paths WHERE path_id = ? AND (user_id = ? OR is_public = 1)");
                $stmt->bind_param("si", $pathId, $user['id']);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($path = $result->fetch_assoc()) {
                    echo json_encode($path);
                } else {
                    http_response_code(404);
                    echo json_encode(["error" => "Path not found or access denied"]);
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
                $pathId = $game['path_id'];
                $name = $game['name'];
                $description = $game['description'];
                $isPublic = $game['is_public'] ? 1 : 0;
                $challengeData = json_encode($game['challenges']);

                // Check if the path already exists
                $stmt = $conn->prepare("SELECT user_id FROM paths WHERE path_id = ?");
                $stmt->bind_param("s", $pathId);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    // Path exists, check if it belongs to the current user
                    $path = $result->fetch_assoc();
                    if ($path['user_id'] != $user['id']) {
                        http_response_code(403);
                        echo json_encode(["error" => "You don't have permission to update this path"]);
                        exit;
                    }
                    
                    // Update existing path
                    $stmt = $conn->prepare("UPDATE paths SET name = ?, description = ?, is_public = ?, challenge_data = ? WHERE path_id = ?");
                    $stmt->bind_param("ssiss", $name, $description, $isPublic, $challengeData, $pathId);
                } else {
                    // Insert new path
                    $stmt = $conn->prepare("INSERT INTO paths (path_id, user_id, name, description, is_public, challenge_data) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt->bind_param("sisssi", $pathId, $user['id'], $name, $description, $isPublic, $challengeData);
                }

                if ($stmt->execute()) {
                    echo json_encode([
                        "path_id" => $pathId,
                        "message" => "Game saved successfully"
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode(["error" => "Failed to save game"]);
                }
            } elseif ($action === 'delete_game') {
                $pathId = $data['path_id'] ?? '';
                if (empty($pathId)) {
                    http_response_code(400);
                    echo json_encode(["error" => "Path ID is required"]);
                    exit;
                }

                // Check if the path belongs to the current user
                $stmt = $conn->prepare("SELECT user_id FROM paths WHERE path_id = ?");
                $stmt->bind_param("s", $pathId);
                $stmt->execute();
                $result = $stmt->get_result();
                
                if ($result->num_rows === 0) {
                    http_response_code(404);
                    echo json_encode(["error" => "Path not found"]);
                    exit;
                }

                $path = $result->fetch_assoc();
                if ($path['user_id'] != $user['id']) {
                    http_response_code(403);
                    echo json_encode(["error" => "You don't have permission to delete this path"]);
                    exit;
                }

                // Delete the path
                $stmt = $conn->prepare("DELETE FROM paths WHERE path_id = ?");
                $stmt->bind_param("s", $pathId);
                
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
    echo json_encode(["error" => "Internal Server Error", "details" => [
        "code" => $e->getCode(),
        "message" => $e->getMessage(),
        "file" => $e->getFile(),
        "line" => $e->getLine()
    ]]);
}