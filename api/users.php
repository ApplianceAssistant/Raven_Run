<?php
header('Content-Type: application/json');
ini_set('display_errors', 0);
error_reporting(E_ALL);

function handleError($errno, $errstr, $errfile, $errline)
{
    $error = array(
        'error' => $errstr,
        'file' => $errfile,
        'line' => $errline
    );
    error_log(json_encode($error));
    echo json_encode(array('error' => 'An internal error occurred'));
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
                }
            } elseif (isset($_GET['id'])) {
                $id = $conn->real_escape_string($_GET['id']);
                $result = $conn->query("SELECT id, username, email FROM users WHERE id = '$id'");
                if ($result->num_rows > 0) {
                    $user = $result->fetch_assoc();
                    $user['email'] = decryptData($user['email']);
                    echo json_encode($user);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'User not found']);
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
                    echo json_encode(['success' => true, 'id' => $id, 'username' => $username, 'email' => $email, 'message' => 'User created successfully']);
                } else {
                    echo json_encode(array('success' => false, 'message' => 'There was a problem creating your account. Please try again.', 'error' => 'Error creating user', 'details' => $stmt->error));
                }
                $stmt->close();
                break;
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
                        echo json_encode(['id' => $user['id'], 'username' => $user['username'], 'message' => "Welcome back $username!"]);
                    } else {
                        http_response_code(401);
                        echo json_encode(['error' => 'Invalid credentials']);
                    }
                } else {
                    http_response_code(401);
                    echo json_encode(['error' => 'Invalid credentials']);
                }
                $stmt->close();
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
