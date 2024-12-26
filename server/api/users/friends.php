<?php

require_once (__DIR__ . '/../../utils/db_connection.php');
require_once (__DIR__ . '/../../utils/encryption.php');
require_once (__DIR__ . '/../../utils/errorHandler.php');
require_once (__DIR__ . '/../auth/auth.php');

// Set content type to JSON
header('Content-Type: application/json');

// Authenticate user
$user = authenticateUser();
if (!$user) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized access']);
    exit;
}

$conn = getDbConnection();

function searchUsers($query)
{
    $query = "$query";
    $stmt = $conn->prepare('SELECT id, username FROM users WHERE username LIKE ? LIMIT 20');
    $stmt->bind_param('s', $query);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_all(MYSQLI_ASSOC);
    releaseDbConnection();
    return $data;
}

function getFriends($userId)
{
    $conn = getDbConnection();
    $stmt = $conn->prepare('SELECT u.id, u.username, profile_picture_url FROM users u 
                            JOIN friend_relationships fr ON u.id = fr.friend_id 
                            WHERE fr.user_id = ?');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_all(MYSQLI_ASSOC);
    releaseDbConnection();
    return $data;
}

function getFriendRequests($userId)
{
    $conn = getDbConnection();
    $stmt = $conn->prepare("SELECT fr.id, u.id as sender_id, u.username as sender_username, u.profile_picture_url as sender_profile_picture_url
                            FROM friend_requests fr 
                            JOIN users u ON fr.sender_id = u.id 
                            WHERE fr.receiver_id = ? AND fr.status = 'pending'");
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_all(MYSQLI_ASSOC);
    releaseDbConnection();
    return $data;
}

function getSentRequests($userId)
{
    $conn = getDbConnection();
    $stmt = $conn->prepare("SELECT fr.id, u.id as receiver_id, u.username as receiver_username 
                           FROM friend_requests fr 
                           JOIN users u ON fr.receiver_id = u.id 
                           WHERE fr.sender_id = ? AND fr.status = 'pending'");
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_all(MYSQLI_ASSOC);
    releaseDbConnection();
    return $data;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    switch ($action) {
        case 'get_sent_requests':
            if (!isset($_GET['user_id'])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'User ID is required']);
                break;
            }
            $sentRequests = getSentRequests($user['id']);
            echo json_encode(['status' => 'success', 'sent_requests' => $sentRequests]);
            break;
        case 'get_friends':
            $friends = getFriends($user['id']);
            echo json_encode(['status' => 'success', 'friends' => $friends]);
            break;

        case 'get_friend_requests':
            $requests = getFriendRequests($user['id']);
            echo json_encode(['status' => 'success', 'friend_requests' => $requests]);
            break;

        case 'search_users':
            $query = $_GET['query'] ?? '';
            if (!$query) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Search query is required']);
                break;
            }
            $users = searchUsers($query);
            // Filter out the current user from search results
            $users = array_filter($users, function ($u) use ($user) {
                return $u['id'] != $user['id'];
            });
            echo json_encode(['status' => 'success', 'users' => array_values($users)]);
            break;

        default:
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
            break;
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';

    switch ($action) {
        case 'send_friend_request':
            if (!isset($data['receiver_id'])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Receiver ID is required']);
                break;
            }

            $conn = getDbConnection();

            // First check if request already exists
            $checkStmt = $conn->prepare('SELECT id FROM friend_requests WHERE sender_id = ? AND receiver_id = ?');
            $checkStmt->bind_param('ii', $user['id'], $data['receiver_id']);
            $checkStmt->execute();
            $result = $checkStmt->get_result();

            if ($result->num_rows > 0) {
                http_response_code(200);
                echo json_encode(['status' => 'success', 'message' => 'Friend request already sent']);
                releaseDbConnection();
                break;
            }

            // If no existing request, proceed with insert
            $stmt = $conn->prepare('INSERT INTO friend_requests (sender_id, receiver_id) VALUES (?, ?)');
            $stmt->bind_param('ii', $user['id'], $data['receiver_id']);

            if ($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Friend request sent']);
            } else {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Failed to send friend request']);
            }
            releaseDbConnection();
            break;

        case 'accept_friend_request':
            // Here we keep request_id for tracking but verify the receiver is the current user
            if (!isset($data['request_id'])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Request ID is required']);
                break;
            }

            $conn = getDbConnection();
            // First verify this request was sent to the current user
            $stmt = $conn->prepare('SELECT sender_id FROM friend_requests WHERE id = ? AND receiver_id = ?');
            $stmt->bind_param('ii', $data['request_id'], $user['id']);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows === 0) {
                http_response_code(403);
                echo json_encode(['status' => 'error', 'message' => 'Unauthorized to accept this request']);
                break;
            }

            $sender = $result->fetch_assoc();

            // Now add the friendship
            $stmt = $conn->prepare('INSERT INTO friend_relationships (user_id, friend_id) VALUES (?, ?), (?, ?)');
            $stmt->bind_param('iiii', $user['id'], $sender['sender_id'], $sender['sender_id'], $user['id']);

            if ($stmt->execute()) {
                // Delete the request
                $stmt = $conn->prepare('DELETE FROM friend_requests WHERE id = ?');
                $stmt->bind_param('i', $data['request_id']);
                $stmt->execute();

                echo json_encode(['status' => 'success', 'message' => 'Friend request accepted']);
            } else {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Failed to accept friend request']);
            }
            releaseDbConnection();
            break;

        case 'ignore_friend_request':
            if (!isset($data['request_id'])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Request ID is required']);
                break;
            }

            $conn = getDbConnection();
            $stmt = $conn->prepare('DELETE FROM friend_requests WHERE id = ? AND receiver_id = ?');
            $stmt->bind_param('ii', $data['request_id'], $user['id']);

            if ($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Friend request ignored']);
            } else {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Failed to ignore friend request']);
            }
            releaseDbConnection();
            break;

        case 'remove_friend':
            if (!isset($data['friend_id'])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Friend ID is required']);
                break;
            }

            // Prevent removal of user ID 1 (permanent friend)
            if ($data['friend_id'] == 1) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Cannot remove this friend']);
                break;
            }

            $stmt = $conn->prepare('DELETE FROM friend_relationships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)');
            $stmt->bind_param('iiii', $user['id'], $data['friend_id'], $data['friend_id'], $user['id']);

            if ($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Friend removed']);
            } else {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Failed to remove friend']);
            }
            releaseDbConnection();
            break;

        default:
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
            break;
    }
}

releaseDbConnection();
