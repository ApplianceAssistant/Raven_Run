<?php
header('Content-Type: application/json');
ini_set('display_errors', 0);
error_reporting(E_ALL);
//only allow post requests from the same origin
header('Access-Control-Allow-Origin: https://crowtours.com');
function handleError($errno, $errstr, $errfile, $errline)
{
    $error = array(
        'error' => $errstr,
        'file' => $errfile,
        'line' => $errline
    );
    error_log(json_encode($error));
    echo json_encode(array('error' => 'An internal error occurred:' . $errstr));
    exit;
}

set_error_handler('handleError');

require_once __DIR__ . '/../server/db_connection.php';
require_once __DIR__ . '/../server/encryption.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $conn = getDbConnection();

    function checkUnique($field, $value)
    {
        global $conn;
        $stmt = $conn->prepare("SELECT id FROM users WHERE $field = ?");
        $stmt->bind_param("s", $value);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->num_rows === 0;
    }

    function createOrUpdateUser($userData)
    {
        global $conn;

        $username = $conn->real_escape_string($userData['username']);
        $encryptedEmail = encryptData($conn->real_escape_string($userData['email']));
        $encryptedPhone = encryptData($conn->real_escape_string($userData['phone']));
        $password = isset($userData['password']) ? hashPassword($userData['password']) : null;
        $firstName = $conn->real_escape_string($userData['first_name']);
        $lastName = $conn->real_escape_string($userData['last_name']);
        $profilePictureUrl = $conn->real_escape_string($userData['profile_picture_url']);

        if (isset($userData['profile_picture_url'])) {
            $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $userData['profile_picture_url']));
            $profilePictureUrl = saveProfileImage($userData['id'], $imageData);
        }

        if (isset($userData['id'])) {
            // Update existing user
            $stmt = $conn->prepare("UPDATE users SET username = ?, email = ?, phone = ?, first_name = ?, last_name = ?, profile_picture_url = ? WHERE id = ?");
            $stmt->bind_param("ssssssi", $username, $encryptedEmail, $encryptedPhone, $firstName, $lastName, $profilePictureUrl, $userData['id']);
        } else {
            // Create new user
            $stmt = $conn->prepare("INSERT INTO users (username, email, phone, password, first_name, last_name, profile_picture_url) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("sssssss", $username, $encryptedEmail, $encryptedPhone, $password, $firstName, $lastName, $profilePictureUrl);
        }

        if ($stmt->execute()) {
            return $stmt->insert_id ?: $userData['id'];
        } else {
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
            $user['email'] = decryptData($user['email']);
            $user['phone'] = $user['phone'] ? decryptData($user['phone']) : null;
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

        $etag = md5($imageData . time());
        $filename = $etag . '.jpg';
        $filePath = $uploadDir . $filename;

        if (file_put_contents($filePath, $imageData)) {
            cleanupOldProfileImages($userId, $uploadDir);
            return "/images/profile_images/$userId/" . $filename;
        }

        return false;
    }

    function cleanupOldProfileImages($userId, $uploadDir)
    {
        $files = glob($uploadDir . '*.jpg');
        usort($files, function($a, $b) {
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
                    $userId = $conn->real_escape_string($_GET['id']);
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
            $data = json_decode(file_get_contents('php://input'), true);
            $action = $data['action'];

            if ($action === 'create') {
                $username = $conn->real_escape_string($data['username']);
                $email = encryptData($conn->real_escape_string($data['email']));
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
                    // Create user-specific profile image directory
                    $userImageDir = $_SERVER['DOCUMENT_ROOT'] . '/images/profile_images/' . $id . '/';
                    if (!file_exists($userImageDir)) {
                        mkdir($userImageDir, 0755, true);
                    }
                    echo json_encode(['success' => true, 'id' => $id, 'username' => $username, 'email' => $email, 'message' => 'User created successfully']);
                } else {
                    echo json_encode(array('success' => false, 'message' => 'There was a problem creating your profile. Please try again.', 'error' => 'Error creating user', 'details' => $stmt->error));
                }
                $stmt->close();
            } elseif ($action === 'login') {
                $username = $conn->real_escape_string($data['username']);
                $password = $data['password'];

                $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
                $stmt->bind_param("s", $username);
                $stmt->execute();
                $result = $stmt->get_result();

                if ($result->num_rows === 1) {
                    $user = $result->fetch_assoc();
                    if (verifyPassword($password, $user['password'])) {
                        http_response_code(200);
                        echo json_encode(['success' => true, 'id' => $user['id'], 'username' => $user['username'], 'message' => "Welcome back $username!"]);
                    } else {
                        http_response_code(401);
                        echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
                    }
                } else {
                    http_response_code(401);
                    echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
                }
                $stmt->close();
            } elseif ($action === 'update') {
                $userId = $conn->real_escape_string($data['id']);
                $userData = $data;
                
                if (isset($_FILES['profile_picture_url'])) {
                    $imageData = file_get_contents($_FILES['profile_picture_url']['tmp_name']);
                    $profilePictureUrl = saveProfileImage($userId, $imageData);
                    if ($profilePictureUrl) {
                        $userData['profile_picture_url'] = $profilePictureUrl;
                    }
                }

                $result = createOrUpdateUser($userData);
                if ($result) {
                    $updatedUser = getUserData($userId);
                    echo json_encode(['success' => true, 'user' => $updatedUser, 'message' => 'Profile updated successfully']);
                } else {
                    echo json_encode(['success' => false, 'error' => 'Failed to update profile']);
                }
            }
            break;

        case 'PUT':
            if (isset($_GET['id'])) {
                $id = $conn->real_escape_string($_GET['id']);
                $data = json_decode(file_get_contents('php://input'), true);
                $username = $conn->real_escape_string($data['username']);
                $email = $conn->real_escape_string($data['email']);

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
                $id = $conn->real_escape_string($_GET['id']);
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
?>