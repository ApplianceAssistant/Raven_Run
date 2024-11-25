<?php
require_once(__DIR__ . '/../server/db_connection.php');
require_once(__DIR__ . '/../server/encryption.php');
require_once(__DIR__ . '/errorHandler.php');
require_once(__DIR__ . '/auth.php');

// Set content type to JSON
header('Content-Type: application/json');

// Get database connection
$conn = getDbConnection();
if (!$conn) {
    handleError(500, "Failed to connect to database");
    exit(0);
}

try {
    $method = $_SERVER['REQUEST_METHOD'];

    function checkUnique($field, $value) {
        global $conn;
        try {
            $allowedFields = ['username', 'email'];
            if (!in_array($field, $allowedFields)) {
                throw new Exception("Invalid field for uniqueness check");
            }
            $stmt = $conn->prepare("SELECT id FROM users WHERE $field = ?");
            $stmt->bind_param("s", $value);
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

    function getAllUsers() {
        global $conn;
        try {
            $stmt = $conn->prepare("SELECT id, username, email, created_at, updated_at FROM users");
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

    function getUserById($id) {
        global $conn;
        try {
            $stmt = $conn->prepare("SELECT id, username, email, phone, first_name, last_name, profile_picture_url FROM users WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $user = $result->fetch_assoc();
            if (!$user) {
                throw new Exception("User not found", 404);
            }
            return $user;
        } catch (Exception $e) {
            throw $e;
        }
    }

    function createUser($userData) {
        global $conn;
        try {
            // Validate required fields
            if (!isset($userData['username']) || !isset($userData['email']) || !isset($userData['password'])) {
                throw new Exception("Missing required fields", 400);
            }

            // Validate email format
            if (!filter_var($userData['email'], FILTER_VALIDATE_EMAIL)) {
                throw new Exception("Invalid email format", 400);
            }

            // Check if email already exists
            if (!checkUnique('email', $userData['email'])['isUnique']) {
                throw new Exception("Email already exists", 409);
            }

            // Check if username already exists
            if (!checkUnique('username', $userData['username'])['isUnique']) {
                throw new Exception("Username already exists", 409);
            }

            // Hash password            
            $hashedPassword = hashPassword($userData['password']);

            // Insert new user
            $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
            $stmt->bind_param("sss", $userData['username'], $userData['email'], $hashedPassword);
            
            if (!$stmt->execute()) {
                throw new Exception("Failed to create user: " . $stmt->error, 500);
            }

            $userId = $stmt->insert_id;
            return [
                'id' => $userId,
                'username' => $userData['username'],
                'email' => $userData['email']
            ];
        } catch (Exception $e) {
            throw $e;
        }
    }

    function updateUser($userData) {
        global $conn;
        try {
            if (!isset($userData['id'])) {
                throw new Exception("User ID is required for update", 400);
            }

            $userId = $userData['id'];
            $updateFields = [];
            $types = "";
            $values = [];

            $allowedFields = ['username', 'email', 'phone', 'first_name', 'last_name', 'profile_picture_url'];
            
            foreach ($allowedFields as $field) {
                if (isset($userData[$field])) {
                    $updateFields[] = "$field = ?";
                    $types .= "s";
                    $values[] = $userData[$field];
                }
            }

            if (empty($updateFields)) {
                throw new Exception("No fields to update", 400);
            }

            // Add user ID to values array and types
            $types .= "i";
            $values[] = $userId;

            $query = "UPDATE users SET " . implode(", ", $updateFields) . " WHERE id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param($types, ...$values);

            if (!$stmt->execute()) {
                throw new Exception("Failed to update user: " . $stmt->error, 500);
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
                            handleError(400, "Field and value are required for uniqueness check");
                            exit(0);
                        }
                        $result = checkUnique($_GET['field'], $_GET['value']);
                        echo json_encode($result);
                        break;

                    case 'get':
                        if (!isset($_GET['id'])) {
                            handleError(400, "User ID is required");
                            exit(0);
                        }
                        $user = getUserById($_GET['id']);
                        echo json_encode($user);
                        break;

                    default:
                        handleError(400, "Invalid action");
                        exit(0);
                }
            } else {
                $users = getAllUsers();
                echo json_encode(['status' => 'success', 'users' => $users]);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                handleError(400, "Invalid JSON data");
                exit(0);
            }

            if (isset($data['action']) && $data['action'] === 'update') {
                $user = updateUser($data);
                echo json_encode(['status' => 'success', 'user' => $user]);
            } else {
                $user = createUser($data);
                echo json_encode(['status' => 'success', 'user' => $user]);
            }
            break;

        default:
            handleError(405, "Method not allowed");
            exit(0);
    }
} catch (Exception $e) {
    $code = $e->getCode() ?: 500;
    handleError($code, $e->getMessage());
} finally {
    releaseDbConnection();
}
