<?php

require_once('../server/db_connection.php');
require_once('errorHandler.php');
require_once('../server/encryption.php');
require_once('auth.php');

ini_set('display_errors', 1);
error_reporting(E_ALL);

/*$user = authenticateUser();
if (!$user) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}*/

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $conn = getDbConnection();

    // Debug: Log the raw input
    $rawInput = file_get_contents('php://input');
    error_log("Raw input: " . $rawInput);

    // Debug: Log the Content-Type header
    $contentType = $_SERVER["CONTENT_TYPE"] ?? '';
    error_log("Content-Type: " . $contentType);

    function checkUnique($field, $value)
    {
        global $conn;
        $allowedFields = ['username', 'email', 'phone'];
        if (!in_array($field, $allowedFields)) {
            throw new Exception("Invalid field for uniqueness check");
        }
        $stmt = $conn->prepare("SELECT id FROM users WHERE $field = ?");
        $stmt->bind_param("s", $value);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->num_rows === 0;
    }

    function createOrUpdateUser($userData)
    {
        global $conn;

        $username = $userData['username'];
        $email = $userData['email'] ?? null;
        $phone = $userData['phone'] ?? null;
        $password = isset($userData['password']) ? hashPassword($userData['password']) : null;
        $firstName = $userData['first_name'] ?? null;
        $lastName = $userData['last_name'] ?? null;
        $profilePictureUrl = $userData['profile_picture_url'] ?? null;

        if (isset($userData['profile_picture_url'])) {
            if (strpos($userData['profile_picture_url'], 'data:image') === 0) {
                $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $userData['profile_picture_url']));
                $newProfilePictureUrl = saveProfileImage($userData['id'] ?? null, $imageData);
                if ($newProfilePictureUrl) {
                    $profilePictureUrl = $newProfilePictureUrl;
                } else {
                    error_log("Failed to save new profile image for user");
                    handleError(500, "Failed to save profile image", __FILE__, __LINE__);
                }
            } else {
                $profilePictureUrl = $userData['profile_picture_url'];
            }
        }

        if (isset($userData['id'])) {
            $stmt = $conn->prepare("UPDATE users SET username = ?, email = ?, phone = ?, first_name = ?, last_name = ?, profile_picture_url = ? WHERE id = ?");
            $stmt->bind_param("ssssssi", $username, $email, $phone, $firstName, $lastName, $profilePictureUrl, $userData['id']);
        } else {
            $stmt = $conn->prepare("INSERT INTO users (username, email, phone, password, first_name, last_name, profile_picture_url) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("sssssss", $username, $email, $phone, $password, $firstName, $lastName, $profilePictureUrl);
        }

        if ($stmt->execute()) {
            $newUserId = $stmt->insert_id ?: $userData['id'];
            if (!isset($userData['id'])) {
                // Add user.id 1 as a friend for new users
                $friendStmt = $conn->prepare("INSERT INTO friend_relationships (user_id, friend_id) VALUES (?, 1), (1, ?)");
                $friendStmt->bind_param("ii", $newUserId, $newUserId);
                $friendStmt->execute();
            }
            return $newUserId;
        } else {
            error_log("Failed to create or update user: " . $stmt->error);
            return false;
        }
    }

    function getUserData($userId)
    {
        global $conn;
        $stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($user = $result->fetch_assoc()) {
            unset($user['password']);
            return $user;
        }

        return null;
    }

    function saveProfileImage($userId, $imageData)
    {
        $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/images/profile_images/' . $userId . '/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Detect image type
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->buffer($imageData);

        switch ($mimeType) {
            case 'image/jpeg':
                $extension = 'jpg';
                break;
            case 'image/png':
                $extension = 'png';
                break;
            case 'image/gif':
                $extension = 'gif';
                break;
            default:
                error_log("Invalid image type: $mimeType");
                return false;
        }

        $etag = md5($imageData . time());
        $filename = $etag . '.' . $extension;
        $filePath = $uploadDir . $filename;

        // Save the image file
        if (file_put_contents($filePath, $imageData)) {
            cleanupOldProfileImages($userId, $uploadDir);
            return "/images/profile_images/$userId/" . $filename;
        }

        return false;
    }

    function cleanupOldProfileImages($userId, $uploadDir)
    {
        $files = glob($uploadDir . '*.jpg');
        usort($files, function ($a, $b) {
            return filemtime($b) - filemtime($a);
        });

        $filesToKeep = 5;
        foreach (array_slice($files, $filesToKeep) as $file) {
            unlink($file);
        }
    }

    switch ($method) {
        case 'GET':
            if (isset($_GET['action'])) {
                $action = $_GET['action'];
                if ($action === 'check_unique') {
                    $field = $_GET['field'];
                    $value = $_GET['value'];
                    $isUnique = checkUnique($field, $value);
                    echo json_encode(['isUnique' => $isUnique]);
                } else if ($action === 'get' && isset($_GET['id'])) {
                    $userId = filter_var($_GET['id'], FILTER_VALIDATE_INT);
                    if ($userId === false) {
                        http_response_code(400);
                        echo json_encode(['error' => 'Invalid user ID']);
                        exit;
                    }
                    $userData = getUserData($userId);
                    if ($userData) {
                        echo json_encode($userData);
                    } else {
                        http_response_code(404);
                        echo json_encode(['error' => 'User not found']);
                    }
                }
            }
            break;

        case 'POST':
             // Parse JSON input
             $jsonData = json_decode($rawInput, true);
            
             // Debug: Log the parsed data
             error_log("Parsed JSON data: " . print_r($jsonData, true));
 
             if (json_last_error() !== JSON_ERROR_NONE) {
                 // If JSON parsing failed, try to use $_POST
                 $data = $_POST;
                 error_log("JSON parsing failed. Using $_POST: " . print_r($_POST, true));
             } else {
                 $data = $jsonData;
             }
 
             $action = $data['action'] ?? null;
 
             // Debug: Log the action and data
             error_log("Action: " . $action);
             error_log("Data: " . print_r($data, true));
 
             if ($action === 'create' || $action === 'update') {
                if ($action === 'create') {
                    if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
                        handleError(400, "Username, email, and password are required", __FILE__, __LINE__);
                    }
                    if (!checkUnique('username', $data['username']) || !checkUnique('email', $data['email'])) {
                        handleError(400, "Username or email already exists", __FILE__, __LINE__);
                    }
                } elseif ($action === 'update') {
                    if (empty($data['id'])) {
                        handleError(400, "User ID is required for updates", __FILE__, __LINE__);
                    }
                }

                $result = createOrUpdateUser($data);
                if ($result) {
                    $userData = getUserData($result);
                    if ($userData) {
                        $response = [
                            'success' => true,
                            'user' => $userData,
                            'message' => $action === 'create' ? 'User created successfully' : 'Profile updated successfully'
                        ];
                        if ($action === 'create') {
                            $token = generateAuthToken($result); // Assuming this function exists in auth.php
                            $response['token'] = $token;
                        }
                        echo json_encode($response);
                    } else {
                        handleError(500, "Failed to retrieve user data", __FILE__, __LINE__);
                    }
                } else {
                    handleError(500, "Failed to " . ($action === 'create' ? 'create user' : 'update profile'), __FILE__, __LINE__);
                }
            } else {
                handleError(400, "Invalid action", __FILE__, __LINE__);
            }
            break;

        case 'PUT':
            if (isset($_GET['id'])) {
                $id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
                if ($id === false) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid user ID']);
                    exit;
                }
                $data = json_decode(file_get_contents('php://input'), true);
                $username = $data['username'];
                $email = $data['email'];

                $stmt = $conn->prepare("UPDATE users SET username = ?, email = ? WHERE id = ?");
                $stmt->bind_param("ssi", $username, $email, $id);

                if ($stmt->execute() && $stmt->affected_rows > 0) {
                    echo json_encode(['id' => $id, 'username' => $username, 'email' => $email]);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'User not found']);
                }
                $stmt->close();
            }
            break;

        case 'DELETE':
            if (isset($_GET['id'])) {
                $id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
                if ($id === false) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid user ID']);
                    exit;
                }
                $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
                $stmt->bind_param("i", $id);

                if ($stmt->execute() && $stmt->affected_rows > 0) {
                    http_response_code(204);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'User not found']);
                }
                $stmt->close();
            }
            break;
    }
} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode(array('error' => 'An unexpected error occurred'));
}
$conn->close();
