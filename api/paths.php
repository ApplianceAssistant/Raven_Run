<?php
require_once 'db_connect.php';
require_once 'auth.php';

// Ensure the request is coming from an authenticated user
/*$user = authenticateUser();
if (!$user) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}*/

// Helper function to check if a user owns a path
function userOwnPath($conn, $userId, $pathId) {
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
        if ($action === 'list') {
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
        // Create a new path
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $conn->prepare("INSERT INTO paths (user_id, name, description, data, is_public) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("isssi", $user['id'], $data['name'], $data['description'], $data['data'], $data['is_public']);
        if ($stmt->execute()) {
            $newId = $conn->insert_id;
            echo json_encode(["id" => $newId, "message" => "Path created successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to create path"]);
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

    case 'DELETE':
        // Delete a path
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

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}

$conn->close();
?>