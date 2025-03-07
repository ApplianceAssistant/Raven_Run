<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once(__DIR__ . '/../../utils/db_connection.php');
require_once(__DIR__ . '/../../utils/errorHandler.php');
require_once(__DIR__ . '/../../utils/image_cleanup.php');
require_once(__DIR__ . '/../../auth/auth.php');

// Set content type to JSON with UTF-8
header('Content-Type: application/json; charset=utf-8');

// Handle CORS
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header('Access-Control-Allow-Methods: POST, DELETE, OPTIONS');
    }
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }
    exit(0);
}

try {
    $conn = getDbConnection();
    if (!$conn) {
        error_log("Database connection failed in game_images.php");
        throw new Exception('Database connection failed');
    }

    $user = authenticateUser();
    if (!$user) {
        error_log("Unauthorized access attempt in game_images.php");
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'Unauthorized'
        ]);
        exit(0);
    }

    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'POST':
            error_log("Processing image upload request");
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data) || empty($data['gameId']) || empty($data['image_data'])) {
                error_log("Missing required data for image upload");
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Missing required data'
                ]);
                exit(0);
            }

            // Validate game ownership
            $stmt = $conn->prepare('SELECT user_id FROM games WHERE gameId = ?');
            $stmt->bind_param('s', $data['gameId']);
            $stmt->execute();
            $result = $stmt->get_result();
            $game = $result->fetch_assoc();

            if (!$game || $game['user_id'] !== $user['id']) {
                error_log("Unauthorized attempt to upload image for game: " . $data['gameId']);
                http_response_code(403);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Not authorized to modify this game'
                ]);
                exit(0);
            }

            // Process and save the image
            try {
                error_log("Saving image for game: " . $data['gameId']);
                $image_data = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $data['image_data']));
                $image_url = saveGameImage($data['gameId'], $image_data);
                
                // Update game record with new image URL
                $stmt = $conn->prepare('UPDATE games SET image_url = ? WHERE gameId = ?');
                $stmt->bind_param('ss', $image_url, $data['gameId']);
                $stmt->execute();

                error_log("Successfully saved image for game: " . $data['gameId']);
                echo json_encode([
                    'status' => 'success',
                    'image_url' => $image_url
                ]);
            } catch (Exception $e) {
                error_log("Failed to save image: " . $e->getMessage());
                http_response_code(500);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Failed to save image: ' . $e->getMessage()
                ]);
            }
            break;

        case 'DELETE':
            error_log("Processing image delete request");
            $gameId = $_GET['gameId'] ?? '';
            
            if (empty($gameId)) {
                error_log("Missing game ID for image deletion");
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Game ID is required'
                ]);
                exit(0);
            }

            // Validate game ownership
            $stmt = $conn->prepare('SELECT user_id, image_url FROM games WHERE gameId = ?');
            $stmt->bind_param('s', $gameId);
            $stmt->execute();
            $result = $stmt->get_result();
            $game = $result->fetch_assoc();

            if (!$game || $game['user_id'] !== $user['id']) {
                error_log("Unauthorized attempt to delete image for game: " . $gameId);
                http_response_code(403);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Not authorized to modify this game'
                ]);
                exit(0);
            }

            // Delete the image
            try {
                error_log("Deleting image for game: " . $gameId);
                
                // Update game record to remove image URL
                $stmt = $conn->prepare('UPDATE games SET image_url = NULL WHERE gameId = ?');
                $stmt->bind_param('s', $gameId);
                $stmt->execute();

                error_log("Successfully deleted image for game: " . $gameId);
                echo json_encode([
                    'status' => 'success'
                ]);
            } catch (Exception $e) {
                error_log("Failed to delete image: " . $e->getMessage());
                http_response_code(500);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Failed to delete image: ' . $e->getMessage()
                ]);
            }
            break;

        default:
            error_log("Method not allowed: " . $method);
            http_response_code(405);
            echo json_encode([
                'status' => 'error',
                'message' => 'Method not allowed'
            ]);
            break;
    }
} catch (Exception $e) {
    error_log("Exception in game_images.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Internal server error',
        'details' => [
            'type' => get_class($e),
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTrace(),
            'timestamp' => date('Y-m-d H:i:s'),
            'request_uri' => $_SERVER['REQUEST_URI'],
            'request_method' => $_SERVER['REQUEST_METHOD']
        ]
    ]);
}
