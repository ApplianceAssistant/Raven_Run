<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../db_connection.php';

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDbConnection();

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $id = $conn->real_escape_string($_GET['id']);
            $result = $conn->query("SELECT id, username, email FROM users WHERE id = '$id'");
            if ($result->num_rows > 0) {
                echo json_encode($result->fetch_assoc());
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
            }
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $username = $conn->real_escape_string($data['username']);
        $email = $conn->real_escape_string($data['email']);
        $password = password_hash($data['password'], PASSWORD_DEFAULT);

        $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $username, $email, $password);

        if ($stmt->execute()) {
            $id = $conn->insert_id;
            http_response_code(201);
            echo json_encode(['id' => $id, 'username' => $username, 'email' => $email]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Error creating user']);
        }
        $stmt->close();
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

$conn->close();
?>