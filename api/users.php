<?php

require_once('../server/db_connection.php');
require_once('errorHandler.php');
require_once('../server/encryption.php');
require_once('auth.php');

/*$user = authenticateUser();
if (!$user) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}*/

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $conn = getDbConnection();

    function checkUnique($field, $value)
    {
        global $conn;
        $allowedFields = ['username', 'email', 'phone']; // Add all allowed fields here
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
        $firstName = $userData['first_name'];
        $lastName = $userData['last_name'];
        $profilePictureUrl = $userData['profile_picture_url'] ?? null;

        if (isset($userData['profile_picture_url'])) {
            if (strpos($userData['profile_picture_url'], 'data:image') === 0) {
                $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $userData['profile_picture_url']));
                $newProfilePictureUrl = saveProfileImage($userData['id'], $imageData);
                if ($newProfilePictureUrl) {
                    $profilePictureUrl = $newProfilePictureUrl;
                } else {
                    error_log("Failed to save new profile image for user " . $userData['id']);
                    handleError(500, $userData, __FILE__, __LINE__);
                }
            } else {
                $profilePictureUrl = $userData['profile_picture_url'];
            }
        } else {
            echo json_encode(['error' => 'No profile picture URL provided', 'userData' => $userData]);
        }

        if (isset($userData['id'])) {
            $stmt = $conn->prepare("UPDATE users SET username = ?, email = ?, phone = ?, first_name = ?, last_name = ?, profile_picture_url = ? WHERE id = ?");
            $stmt->bind_param("ssssssi", $username, $email, $phone, $firstName, $lastName, $profilePictureUrl, $userData['id']);
        } else {
            $stmt = $conn->prepare("INSERT INTO users (username, email, phone, password, first_name, last_name, profile_picture_url) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("sssssss", $username, $email, $phone, $password, $firstName, $lastName, $profilePictureUrl);
        }

        if ($stmt->execute()) {
            $newUserId = $stmt->insert_id;
            if ($newUserId) {
                // Add user.id 1 as a friend
                $friendStmt = $conn->prepare("INSERT INTO friend_relationships (user_id, friend_id) VALUES (?, 1), (1, ?)");
                $friendStmt->bind_param("ii", $newUserId, $newUserId);
                $friendStmt->execute();
                return $newUserId;
            } else {
                return $userData['id'];
            }
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
                    if ($field === 'email') {
                        $value = encryptData($value);
                    }
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
            $data = $_POST ?? null;
            $action = isset($_POST['action']) ? $_POST['action'] : null;
            if (!$action) {
                $data = json_decode(file_get_contents('php://input'), true);
                $action = isset($data['action']) ? $data['action'] : null;
            }
            if ($action === 'create') {
                $username = $data['username'];
                $email = $data['email'];
                $password = hashPassword($data['password']);

                $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
                if ($stmt === false) {
                    echo json_encode(array('error' => 'Prepare failed', 'details' => $conn->error));
                    exit;
                }
                if (!$stmt->bind_param("sss", $username, $email, $password)) {
                    echo json_encode(array('error' => 'Binding parameters failed', 'details' => $stmt->error));
                    exit;
                }

                if ($stmt->execute()) {
                    $id = $conn->insert_id;
                    $userImageDir = $_SERVER['DOCUMENT_ROOT'] . '/images/profile_images/' . $id . '/';
                    if (!file_exists($userImageDir)) {
                        mkdir($userImageDir, 0755, true);
                    }
                    echo json_encode(['success' => true, 'id' => $id, 'username' => $username, 'email' => $email, 'message' => 'User created successfully']);
                } else {
                    echo json_encode(array('success' => false, 'message' => 'There was a problem creating your profile. Please try again.', 'error' => 'Error creating user', 'details' => $stmt->error));
                }
                $stmt->close();
            } elseif ($action === 'update') {
                $userId = filter_var($data['id'], FILTER_VALIDATE_INT);
                if ($userId === false) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid user ID']);
                    exit;
                }
                $userData = $data;

                $result = createOrUpdateUser($userData);
                if ($result) {
                    $updatedUser = getUserData($userId);
                    if ($updatedUser) {
                        echo json_encode(['success' => true, 'user' => $updatedUser, 'message' => 'Profile updated successfully']);
                    } else {
                        echo json_encode(['success' => false, 'error' => 'Failed to retrieve updated user data']);
                    }
                } else {
                    echo json_encode(['success' => false, 'error' => 'Failed to update profile']);
                }
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
