<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once (__DIR__ . '/../../utils/db_connection.php');
require_once (__DIR__ . '/../../utils/encryption.php');
require_once (__DIR__ . '/../../utils/errorHandler.php');
require_once (__DIR__ . '/../auth/auth.php');
require_once __DIR__ . '/../../utils/rateLimit.php';
require_once (__DIR__ . '/../../utils/unitConversion.php');

ini_set('default_charset', 'UTF-8');
mb_internal_encoding('UTF-8');

// Set content type to JSON with UTF-8
header('Content-Type: application/json; charset=utf-8');

// Handle CORS for both local and staging
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    }
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }
    exit(0);
}
// Get client IP address
$ip_address = $_SERVER['REMOTE_ADDR'];

// Check rate limit (30 requests per minute)
if (!checkRateLimit($ip_address, 'searchGames', 30, 60)) {
    http_response_code(429);
    echo json_encode([
        'status' => 'error',
        'message' => 'Rate limit exceeded. Please try again later.'
    ]);
    exit;
}

// Authenticate user
$user = authenticateUser();
if (!$user) {
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'message' => 'Unauthorized access'
    ]);
    exit;
}

// Get search parameters
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$latitude = isset($_GET['latitude']) ? floatval($_GET['latitude']) : null;
$longitude = isset($_GET['longitude']) ? floatval($_GET['longitude']) : null;
$radius = isset($_GET['radius']) ? floatval($_GET['radius']) : 80; // Default 80 km (approximately 50 miles)
$difficulty = isset($_GET['difficulty']) ? $_GET['difficulty'] : null;
$duration = isset($_GET['duration']) ? intval($_GET['duration']) : null;
$sort_by = isset($_GET['sort_by']) ? $_GET['sort_by'] : 'rating';
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$per_page = 10;

try {
    $conn = getDbConnection();
    $params = [];
    $types = '';
    
    // Base query for public games
    $sql = "SELECT g.*, 
            u.username as creator_name";
    
    // Only add distance calculation if location parameters are provided
    if ($latitude !== null && $longitude !== null) {
        $sql .= ",
            ST_Distance_Sphere(
                point(g.start_longitude, g.start_latitude),
                point(?, ?)
            ) * 0.001 as distance_km";
    } else {
        $sql .= ", NULL as distance_km";
    }

    // Add relevance score calculation if search is provided
    if ($search) {
        $sql .= ",
            (
                CASE 
                    WHEN g.title LIKE CONCAT('%', ?, '%') THEN 10
                    ELSE 0
                END +
                CASE 
                    WHEN g.description LIKE CONCAT('%', ?, '%') THEN 3
                    ELSE 0
                END +
                CASE 
                    WHEN JSON_CONTAINS(g.tags, JSON_ARRAY(?)) THEN 2
                    ELSE 0
                END
            ) as relevance_score";
    } else {
        $sql .= ", 0 as relevance_score";
    }

    $sql .= " FROM games g
              LEFT JOIN users u ON g.user_id = u.id
              WHERE g.is_public = 1";
    
    // Initialize parameters array and types string
    $params = [];
    $types = '';

    // Add location parameters if provided
    if ($latitude !== null && $longitude !== null) {
        $params[] = $longitude;
        $params[] = $latitude;
        $types .= 'dd';

        if ($radius) {
            $sql .= " AND ST_Distance_Sphere(
                point(g.start_longitude, g.start_latitude),
                point(?, ?)
            ) * 0.001 <= ?";
            $params[] = $longitude;
            $params[] = $latitude;
            $params[] = $radius;
            $types .= 'ddd';
        }
    }

    // Add search parameters if provided
    if ($search) {
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
        $types .= 'sss';
        
        $sql .= " AND (
            g.title LIKE CONCAT('%', ?, '%') OR
            g.description LIKE CONCAT('%', ?, '%') OR
            JSON_CONTAINS(g.tags, JSON_ARRAY(?))
        )";
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
        $types .= 'sss';
    }

    // Add difficulty filter if provided
    if ($difficulty) {
        $sql .= " AND g.difficulty_level = ?";
        $params[] = $difficulty;
        $types .= 's';
    }

    // Add duration filter if provided
    if ($duration) {
        $sql .= " AND g.estimated_time <= ?";
        $params[] = $duration;
        $types .= 'i';
    }

    // Add sorting
    if ($sort_by === 'distance' && $latitude !== null && $longitude !== null) {
        $sql .= " ORDER BY distance_km ASC";
    } else if ($sort_by === 'relevance' && $search) {
        $sql .= " ORDER BY relevance_score DESC";
    } else {
        $sql .= " ORDER BY g.avg_rating DESC";
    }

    // Add pagination
    $sql .= " LIMIT ? OFFSET ?";
    $params[] = $per_page;
    $params[] = ($page - 1) * $per_page;
    $types .= 'ii';

    // Prepare count query (remove LIMIT and SELECT specific columns)
    $count_sql = "SELECT COUNT(*) as total FROM games g WHERE g.is_public = 1";
    if ($latitude !== null && $longitude !== null && $radius) {
        $count_sql .= " AND ST_Distance_Sphere(
            point(g.start_longitude, g.start_latitude),
            point(?, ?)
        ) * 0.001 <= ?";
    }
    if ($search) {
        $count_sql .= " AND (
            g.title LIKE CONCAT('%', ?, '%') OR
            g.description LIKE CONCAT('%', ?, '%') OR
            JSON_CONTAINS(g.tags, JSON_ARRAY(?))
        )";
    }
    if ($difficulty) {
        $count_sql .= " AND g.difficulty_level = ?";
    }
    if ($duration) {
        $count_sql .= " AND g.estimated_time <= ?";
    }

    // Execute count query first
    $count_stmt = $conn->prepare($count_sql);
    if (!empty($params)) {
        // Remove the LIMIT/OFFSET parameters for count query
        $count_params = array_slice($params, 0, -2);
        $count_types = substr($types, 0, -2);
        if (!empty($count_params)) {
            $count_stmt->bind_param($count_types, ...$count_params);
        }
    }
    $count_stmt->execute();
    $total_result = $count_stmt->get_result()->fetch_assoc();
    $total_games = $total_result['total'];

    // Execute main query
    $stmt = $conn->prepare($sql);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    $games = [];
    while ($row = $result->fetch_assoc()) {
        // Clean up the response data
        $game = [
            'id' => $row['gameId'],
            'title' => $row['title'],
            'description' => $row['description'],
            'difficulty' => $row['difficulty_level'],
            'distance' => $row['distance_km'] ? round($row['distance_km'], 1) : null,
            'avg_rating' => $row['avg_rating'],
            'rating_count' => $row['rating_count'],
            'duration' => $row['estimated_time'],
            'tags' => json_decode($row['tags'], true),
            'creatorName' => $row['creator_name'],
            'created_at' => $row['created_at']
        ];
        $games[] = $game;
    }

    echo json_encode([
        'status' => 'success',
        'data' => [
            'games' => $games,
            'total' => $total_games,
            'page' => $page,
            'per_page' => $per_page,
            'total_pages' => ceil($total_games / $per_page)
        ]
    ]);

} catch (Exception $e) {
    handleError(500, $e->getMessage(), __FILE__, __LINE__);
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'An error occurred while searching games'
    ]);
}
