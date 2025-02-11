<?php
require_once (__DIR__ . '/../../utils/db_connection.php');
require_once (__DIR__ . '/../../utils/encryption.php');
require_once (__DIR__ . '/../../utils/errorHandler.php');
require_once (__DIR__ . '/../auth/auth.php');

// Set content type to JSON
header('Content-Type: application/json');

// Get database connection
$conn = getDbConnection();
if (!$conn) {
    handleError(500, 'Failed to connect to database' , __FILE__, __LINE__);
    exit(0);
}

// Authenticate user for protected routes
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Skip authentication for create user and check unique
$skipAuth = false;

// Check if it's a uniqueness check
if ($method === 'GET' && $action === 'check_unique') {
    $skipAuth = true;
}

// Check if it's a user creation request
if ($method === 'POST') {
    if (isset($_POST['action']) && $_POST['action'] === 'create') {
        // Handle form data
        $skipAuth = true;
    } else {
        // Handle JSON data
        $jsonData = json_decode(file_get_contents('php://input'), true);
        if (isset($jsonData['action']) && $jsonData['action'] === 'create') {
            $skipAuth = true;
        }
    }
}

if (!$skipAuth) {
    $user = authenticateUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized access']);
        exit;
    }
}

// Function to get the base URL for the API
function getBaseUrl()
{
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://';
    $host = $_SERVER['HTTP_HOST'];
    return $protocol . $host;
}

try {
    $method = $_SERVER['REQUEST_METHOD'];

    function checkUnique($field, $value)
    {
        global $conn;
        try {
            $allowedFields = ['username', 'email'];
            if (!in_array($field, $allowedFields)) {
                throw new Exception('Invalid field for uniqueness check');
            }
            $stmt = $conn->prepare("SELECT id FROM users WHERE $field = ?");
            $stmt->bind_param('s', $value);
            $stmt->execute();
            $result = $stmt->get_result();
            $response = ['isUnique' => ($result->num_rows === 0)];

            // Add debug info to response
            if (isset($GLOBALS['cors_debug'])) {
                $response['debug'] = $GLOBALS['cors_debug'];
            }

            return $response;
        } catch (Exception $e) {
            throw $e;
        }
    }

    function getAllUsers()
    {
        global $conn;
        try {
            $stmt = $conn->prepare('SELECT id, username, email, created_at, updated_at FROM users');
            $stmt->execute();
            $result = $stmt->get_result();
            $users = [];
            while ($row = $result->fetch_assoc()) {
                $users[] = $row;
            }
            return $users;
        } catch (Exception $e) {
            throw $e;
        }
    }

    function getUserById($id)
    {
        global $conn;
        try {
            $stmt = $conn->prepare('SELECT id, username, email, phone, first_name, last_name, profile_picture_url FROM users WHERE id = ?');
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $user = $result->fetch_assoc();

            if ($user && $user['profile_picture_url']) {
                // Convert relative game to full URL
                $user['profile_picture_url'] = getBaseUrl() . $user['profile_picture_url'];
            }

            return $user;
        } catch (Exception $e) {
            throw $e;
        }
    }

    function createUser($userData)
    {
        global $conn;
        try {
            // Check if username already exists
            if (!checkUnique('username', $userData['username'])['isUnique']) {
                echo json_encode(['error' => 'Username already exists']);
                throw new Exception('Username already exists', 409);
            }

            // Validate email format
            if (!filter_var($userData['email'], FILTER_VALIDATE_EMAIL)) {
                echo json_encode(['error' => 'Invalid email format']);
                throw new Exception('Invalid email format', 400);
            }

            // Check if email already exists
            if (!checkUnique('email', $userData['email'])['isUnique']) {
                echo json_encode(['error' => 'Email already exists']);
                throw new Exception('Email already exists', 409);
            }

            // Validate required fields
            if (!isset($userData['username']) || !isset($userData['email']) || !isset($userData['password'])) {
                echo json_encode(['error' => 'Missing required fields']);
                throw new Exception('Missing required fields', 400);
            }

            // Hash password
            $hashedPassword = hashPassword($userData['password']);

            $conn->begin_transaction();

            // Insert new user
            $stmt = $conn->prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
            $stmt->bind_param('sss', $userData['username'], $userData['email'], $hashedPassword);

            $stmt->execute();
            $newUserId = $conn->insert_id;

            // Automatically add user ID 1 as a friend
            $stmt = $conn->prepare('INSERT INTO friend_relationships (user_id, friend_id) VALUES (?, 1)');
            $stmt->bind_param('i', $newUserId);
            $stmt->execute();

            // Also add the reverse relationship
            $stmt = $conn->prepare('INSERT INTO friend_relationships (user_id, friend_id) VALUES (1, ?)');
            $stmt->bind_param('i', $newUserId);
            $stmt->execute();

            $conn->commit();

            // Generate auth token
            $token = generateAuthToken($newUserId);
            if (!$token) {
                $conn->rollback();
                throw new Exception('Failed to generate auth token', 500);
            }

            $conn->commit();
            
            return [
                'id' => $newUserId,
                'username' => $userData['username'],
                'email' => $userData['email'],
                'token' => $token
            ];
        } catch (Exception $e) {
            if ($conn->connect_error === null) {
                $conn->rollback();
            }
            throw $e;
        }
    }

    function updateUser($userData)
    {
        global $conn;
        try {
            if (!isset($userData['id'])) {
                throw new Exception('User ID is required for update', 400);
            }

            // Validate phone number if present
            if (!empty($userData['phone']) && $userData['phone'] !== 'null') {
                $phone = preg_replace('/\D/', '', $userData['phone']);
                if (strlen($phone) !== 10) {
                    throw new Exception('Invalid phone number format', 400);
                }
                $userData['phone'] = $phone;  // Store compressed format
            } else {
                $userData['phone'] = null;  // Ensure empty phone is stored as NULL
            }

            $userId = $userData['id'];
            $updateFields = [];
            $types = '';
            $values = [];

            $allowedFields = ['username', 'email', 'phone', 'first_name', 'last_name', 'profile_picture_url'];
            $nullableFields = ['phone', 'first_name', 'last_name'];

            foreach ($allowedFields as $field) {
                // For nullable fields, we want to process them even if they're empty
                if (isset($userData[$field]) || in_array($field, $nullableFields)) {
                    $value = $userData[$field] ?? '';

                    // Convert empty strings and 'null' to NULL for optional fields
                    if (in_array($field, $nullableFields) && (empty($value) || $value === 'null' || $value === '')) {
                        $updateFields[] = "$field = NULL";
                    } else {
                        $updateFields[] = "$field = ?";
                        $types .= 's';
                        $values[] = $value;
                    }
                }
            }

            if (empty($updateFields)) {
                echo json_encode(['error' => 'No fields to update']);
                throw new Exception('No fields to update', 400);
            }

            // Add user ID to values array and types
            $types .= 'i';
            $values[] = $userId;

            $query = 'UPDATE users SET ' . implode(', ', $updateFields) . ' WHERE id = ?';
            $stmt = $conn->prepare($query);

            if (!empty($values)) {
                $stmt->bind_param($types, ...$values);
            }

            if (!$stmt->execute()) {
                throw new Exception('Failed to update user: ' . $stmt->error, 500);
            }

            return getUserById($userId);
        } catch (Exception $e) {
            throw $e;
        }
    }

    switch ($method) {
        case 'GET':
            if (isset($_GET['action'])) {
                switch ($_GET['action']) {
                    case 'check_unique':
                        if (!isset($_GET['field']) || !isset($_GET['value'])) {
                            handleError(400, 'Field and value are required for uniqueness check', __FILE__, __LINE__);
                            exit(0);
                        }
                        $result = checkUnique($_GET['field'], $_GET['value']);
                        echo json_encode($result);
                        break;

                    case 'get':
                        if (!isset($_GET['id'])) {
                            handleError(400, 'User ID is required', __FILE__, __LINE__);
                            exit(0);
                        }
                        $user = getUserById($_GET['id']);
                        echo json_encode($user);
                        break;

                    default:
                        handleError(400, 'Invalid action', __FILE__, __LINE__);
                        exit(0);
                }
            } else {
                $users = getAllUsers();
                echo json_encode(['status' => 'success', 'users' => $users]);
            }
            break;

        case 'POST':
            $data = [];

            // Get JSON data
            $rawInput = file_get_contents('php://input');
            $data = json_decode($rawInput, true) ?? [];

            // Handle base64 image
            if (!empty($data['profile_picture'])) {
                $uploadDir = __DIR__ . '/../uploads/profiles/';
                if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }

                $fileName = uniqid() . '_profile.jpg';
                $targetPath = $uploadDir . $fileName;

                // Extract and save base64 image
                $base64Data = preg_replace('#^data:image/\w+;base64,#i', '', $data['profile_picture']);
                $imageData = base64_decode($base64Data);

                if (file_put_contents($targetPath, $imageData)) {
                    $data['profile_picture_url'] = '/uploads/profiles/' . $fileName;
                }
                unset($data['profile_picture']);
            }

            if (empty($data)) {
                handleError(400, 'No valid request data found', __FILE__, __LINE__);
                exit(0);
            }

            if (isset($data['action']) && $data['action'] === 'update') {
                $user = updateUser($data);
                echo json_encode(['success' => true, 'user' => $user]);
            } else {
                $user = createUser($data);
                echo json_encode(['success' => true, 'user' => $user]);
            }
            break;

        default:
            handleError(405, 'Method not allowed', __FILE__, __LINE__);
            exit(0);
    }
} catch (Exception $e) {
    $code = $e->getCode() ?: 500;
    handleError($code, $e->getMessage(), __FILE__, __LINE__);
} finally {
    releaseDbConnection();
}
