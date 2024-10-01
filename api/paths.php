<?php

require_once('../server/db_connection.php');
require_once('errorHandler.php');
require_once('../server/encryption.php');
require_once('auth.php');


// Ensure the request is coming from an authenticated user
/*$user = authenticateUser();
if (!$user) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}*/
try {
    $conn = getDbConnection();

    // Helper function to check if a user owns a path
    function userOwnPath($conn, $userId, $pathId)
    {
        global $conn;
        $stmt = $conn->prepare("SELECT user_id FROM paths WHERE id = ?");
        $stmt->bind_param("i", $pathId);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            return $row['user_id'] == $userId;
        }
        return false;
    }

    // Handle different API endpoints
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';

    switch ($method) {
        case 'GET':
            if ($action === 'get_games') {
                // Get all games for the authenticated user
                $stmt = $conn->prepare("SELECT id, name, description, challenge_data, is_public, path_id FROM paths WHERE user_id = ?");
                $stmt->bind_param("i", $user['id']);
                $stmt->execute();
                $result = $stmt->get_result();
                $games = $result->fetch_all(MYSQLI_ASSOC);

                // Convert the games to the expected format
                $formattedGames = array_map(function ($game) {
                    return [
                        'id' => $game['id'],
                        'name' => $game['name'],
                        'description' => $game['description'],
                        'challenges' => json_decode($game['challenge_data'], true)['challenges'] ?? [],
                        'public' => (bool)$game['is_public'],
                        'pathId' => $game['path_id']
                    ];
                }, $games);

                echo json_encode($formattedGames);
            } elseif ($action === 'list') {
                // List user's paths
                $stmt = $conn->prepare("SELECT id, name, description, data, is_public FROM paths WHERE user_id = ?");
                $stmt->bind_param("i", $user['id']);
                $stmt->execute();
                $result = $stmt->get_result();
                $paths = $result->fetch_all(MYSQLI_ASSOC);
                echo json_encode($paths);
            } elseif ($action === 'get' && isset($_GET['id'])) {
                // Get a specific path
                $pathId = $_GET['id'];
                $stmt = $conn->prepare("SELECT id, name, description, data, is_public FROM paths WHERE id = ? AND (user_id = ? OR is_public = 1)");
                $stmt->bind_param("ii", $pathId, $user['id']);
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
                $debug = [];

                if (isset($game['server_id'])) {
                    $debug[] = "UPDATE Server ID: " . $game['server_id'];
                    // Update existing game
                    $query = "UPDATE paths SET title = ?, description = ?, is_public = ?, path_id = ?, updated_at = CURRENT_TIMESTAMP WHERE path_id = ? AND user_id = ?";
                    $stmt = $conn->prepare($query);

                    if ($stmt === false) {
                        handleError(500, "Prepare failed: " . $conn->error, __FILE__, __LINE__);
                        http_response_code(500);
                        exit;
                    }

                    $bindResult = $stmt->bind_param("ssissi", $game['title'], $game['description'], $game['is_public'], $game['path_id'], $game['server_id'], $user['id']);
                } else {
                    // Create new game
                    $query = "INSERT INTO paths (user_id, title, description, is_public, path_id, challenge_data) VALUES (?, ?, ?, ?, ?, ?)";
                    $stmt = $conn->prepare($query);

                    if ($stmt === false) {
                        handleError(500, "Prepare failed: " . $conn->error, __FILE__, __LINE__);
                        http_response_code(500);
                        exit;
                    }

                    $bindResult = $stmt->bind_param("issis", $user['id'], $game['title'], $game['description'], $game['is_public'], $game['path_id'], $game['challenges']);
                }
                if ($bindResult === false) {
                    handleError(500, "Bind failed: " . $stmt->error, __FILE__, __LINE__);
                    http_response_code(500);
                    exit;
                }

                if ($stmt->execute()) {
                    $server_id = $game['server_id'] ?? $conn->insert_id;
                    $debug['affected_rows'] = $stmt->affected_rows;
                    $debug['server_id'] = $server_id;
                    echo json_encode([
                        "server_id" => $server_id,
                        "local_id" => $game['local_id'],
                        "message" => "Game saved successfully",
                        "debug" => $debug
                    ]);
                } else {
                    handleError(500, "Exicute failed: " . $stmt->error, __FILE__, __LINE__);
                    http_response_code(500);
                    exit;
                }
            } elseif ($action === 'delete_game') {
                if (isset($_GET['id'])) {
                    $pathId = $_GET['id'];
                    if (userOwnPath($conn, $user['id'], $pathId)) {
                        $stmt = $conn->prepare("DELETE FROM paths WHERE id = ?");
                        $stmt->bind_param("i", $pathId);
                        if ($stmt->execute()) {
                            echo json_encode(["message" => "Path deleted successfully"]);
                        } else {
                            http_response_code(500);
                            echo json_encode(["error" => "Failed to delete path"]);
                        }
                    } else {
                        http_response_code(403);
                        echo json_encode(["error" => "You don't have permission to delete this path"]);
                    }
                } else {
                    http_response_code(400);
                    echo json_encode(["error" => "Path ID is required"]);
                }
                break;
            } else {
                http_response_code(400);
                echo json_encode(["error" => "Invalid action"]);
            }
            break;

        case 'PUT':
            // Update an existing path
            if (isset($_GET['id'])) {
                $pathId = $_GET['id'];
                if (userOwnPath($conn, $user['id'], $pathId)) {
                    $data = json_decode(file_get_contents('php://input'), true);
                    $stmt = $conn->prepare("UPDATE paths SET name = ?, description = ?, data = ?, is_public = ? WHERE id = ?");
                    $stmt->bind_param("sssii", $data['name'], $data['description'], $data['data'], $data['is_public'], $pathId);
                    if ($stmt->execute()) {
                        echo json_encode(["message" => "Path updated successfully"]);
                    } else {
                        http_response_code(500);
                        echo json_encode(["error" => "Failed to update path"]);
                    }
                } else {
                    http_response_code(403);
                    echo json_encode(["error" => "You don't have permission to update this path"]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["error" => "Path ID is required"]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
            break;
    }

    $conn->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
