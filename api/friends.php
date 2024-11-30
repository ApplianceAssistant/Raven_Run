<?php

require_once (__DIR__ . '/../server/db_connection.php');
require_once (__DIR__ . '/../server/encryption.php');
require_once (__DIR__ . '/errorHandler.php');
require_once (__DIR__ . '/auth.php');

// Set content type to JSON
header('Content-Type: application/json');

function searchUsers($query) {
    $conn = getDbConnection();
    $query = "%$query%";
    $stmt = $conn->prepare("SELECT id, username FROM users WHERE username LIKE ? LIMIT 20");
    $stmt->bind_param("s", $query);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_all(MYSQLI_ASSOC);
    releaseDbConnection();
    return $data;
}

function getFriends($userId) {
    $conn = getDbConnection();
    $stmt = $conn->prepare("SELECT u.id, u.username, profile_picture_url FROM users u 
                            JOIN friend_relationships fr ON u.id = fr.friend_id 
                            WHERE fr.user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_all(MYSQLI_ASSOC);
    releaseDbConnection();
    return $data;
}

function getFriendRequests($userId) {
    $conn = getDbConnection();
    $stmt = $conn->prepare("SELECT fr.id, u.id as sender_id, u.username as sender_username 
                            FROM friend_requests fr 
                            JOIN users u ON fr.sender_id = u.id 
                            WHERE fr.receiver_id = ? AND fr.status = 'pending'");
    $stmt->bind_param("i", $userId);
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
        case 'search_users':
            $query = $_GET['query'] ?? '';
            $users = searchUsers($query);
            echo json_encode(['users' => $users]);
            break;

        case 'get_friends':
            $user_id = $_GET['user_id'] ?? null;
            if ($user_id) {
                $friends = getFriends($user_id);
                echo json_encode(['friends' => $friends]);
            } else {
                echo json_encode(['error' => 'Invalid user_id']);
            }
            break;

        case 'get_friend_requests':
            $user_id = $_GET['user_id'] ?? null;
            if ($user_id) {
                $requests = getFriendRequests($user_id);
                echo json_encode(['friend_requests' => $requests]);
            } else {
                echo json_encode(['error' => 'Invalid user_id']);
            }
            break;

        default:
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
            break;
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';

    switch ($action) {
        case 'send_friend_request':
            $sender_id = $data['sender_id'] ?? null;
            $receiver_id = $data['receiver_id'] ?? null;
            
            if ($sender_id && $receiver_id) {
                $conn = getDbConnection();
                $stmt = $conn->prepare("INSERT INTO friend_requests (sender_id, receiver_id) VALUES (?, ?)");
                $stmt->bind_param("ii", $sender_id, $receiver_id);
                
                if ($stmt->execute()) {
                    releaseDbConnection();
                    echo json_encode(['success' => true]);
                } else {
                    releaseDbConnection();
                    echo json_encode(['error' => 'Failed to send friend request']);
                }
            } else {
                echo json_encode(['error' => 'Invalid sender_id or receiver_id']);
            }
            break;

        case 'accept_friend_request':
            $request_id = $data['request_id'] ?? null;
            
            if ($request_id) {
                $conn = getDbConnection();
                $conn->begin_transaction();
                try {
                    $stmt = $conn->prepare("SELECT sender_id, receiver_id FROM friend_requests WHERE id = ? AND status = 'pending'");
                    $stmt->bind_param("i", $request_id);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    $request = $result->fetch_assoc();

                    if ($request) {
                        $stmt = $conn->prepare("INSERT INTO friend_relationships (user_id, friend_id) VALUES (?, ?), (?, ?)");
                        $stmt->bind_param("iiii", $request['sender_id'], $request['receiver_id'], $request['receiver_id'], $request['sender_id']);
                        $stmt->execute();

                        $stmt = $conn->prepare("UPDATE friend_requests SET status = 'accepted' WHERE id = ?");
                        $stmt->bind_param("i", $request_id);
                        $stmt->execute();

                        $conn->commit();
                        releaseDbConnection();
                        echo json_encode(['success' => true]);
                    } else {
                        releaseDbConnection();
                        echo json_encode(['error' => 'Invalid friend request']);
                    }
                } catch (Exception $e) {
                    $conn->rollback();
                    releaseDbConnection();
                    echo json_encode(['error' => 'Failed to accept friend request']);
                }
            } else {
                echo json_encode(['error' => 'Invalid request_id']);
            }
            break;

        case 'ignore_friend_request':
            $request_id = $data['request_id'] ?? null;
            
            if ($request_id) {
                $conn = getDbConnection();
                $stmt = $conn->prepare("UPDATE friend_requests SET status = 'rejected' WHERE id = ?");
                $stmt->bind_param("i", $request_id);
                
                if ($stmt->execute()) {
                    releaseDbConnection();
                    echo json_encode(['success' => true]);
                } else {
                    releaseDbConnection();
                    echo json_encode(['error' => 'Failed to ignore friend request']);
                }
            } else {
                echo json_encode(['error' => 'Invalid request_id']);
            }
            break;

        case 'remove_friend':
            $user_id = $data['user_id'] ?? null;
            $friend_id = $data['friend_id'] ?? null;
            
            if ($user_id && $friend_id) {
                $conn = getDbConnection();
                $stmt = $conn->prepare("DELETE FROM friend_relationships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)");
                $stmt->bind_param("iiii", $user_id, $friend_id, $friend_id, $user_id);
                
                if ($stmt->execute()) {
                    releaseDbConnection();
                    echo json_encode(['success' => true]);
                } else {
                    releaseDbConnection();
                    echo json_encode(['error' => 'Failed to remove friend']);
                }
            } else {
                echo json_encode(['error' => 'Invalid user_id or friend_id']);
            }
            break;

        default:
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
            break;
    }
}

releaseDbConnection();