<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once (__DIR__ . '/../../utils/db_connection.php');
require_once (__DIR__ . '/../../utils/encryption.php');
require_once (__DIR__ . '/../../utils/errorHandler.php');
require_once (__DIR__ . '/../../auth/auth.php');
require_once (__DIR__ . '/../../utils/rateLimit.php');
require_once (__DIR__ . '/../../utils/unitConversion.php');

ini_set('default_charset', 'UTF-8');
mb_internal_encoding('UTF-8');

// Set content type to JSON with UTF-8
header('Content-Type: application/json; charset=utf-8');

// Handle CORS for both local and staging
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}

// Access-Control headers are received during OPTIONS requests
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

// Get parameters
$gameId = isset($_GET['gameId']) ? trim($_GET['gameId']) : null;
error_log("searchGames.php - Received gameId: " . ($gameId ?? 'null'));

$search = isset($_GET['search']) ? trim($_GET['search']) : null;
error_log("searchGames.php - Received search: " . ($search ?? 'null'));

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$per_page = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 10;
$sort_by = isset($_GET['sort_by']) ? $_GET['sort_by'] : 'rating';
$difficulty_level = isset($_GET['difficulty_level']) ? $_GET['difficulty_level'] : null;
$latitude = isset($_GET['latitude']) ? (float)$_GET['latitude'] : null;
$longitude = isset($_GET['longitude']) ? (float)$_GET['longitude'] : null;
$radius = isset($_GET['radius']) ? (float)$_GET['radius'] : null;
$duration = isset($_GET['duration']) ? $_GET['duration'] : null;

// Initialize parameters array and types string
$params = [];
$types = '';

try {
    $conn = getDbConnection();

    // Base query for public games
    $sql = "SELECT g.*, 
            g.image_url,
            g.distance as stored_distance,  
            u.username as creator_name";

    // If searching by gameId, we need to check friend relationships
    if ($gameId !== null) {
        error_log("searchGames.php - Searching by gameId: " . $gameId);
        error_log("searchGames.php - Current user ID: " . $user['id']);

        // First, let's check if the game exists at all
        $check_sql = "SELECT * FROM games WHERE gameId = ?";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param('s', $gameId);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        error_log("searchGames.php - Game exists check rows: " . $check_result->num_rows);
        if ($check_result->num_rows > 0) {
            $game_data = $check_result->fetch_assoc();
            error_log("searchGames.php - Found game: " . print_r($game_data, true));
        }

        $sql = "SELECT DISTINCT g.*, 
                g.image_url,
                g.distance as stored_distance,  
                u.username as creator_name,
                CASE 
                    WHEN g.is_public = 1 THEN true
                    WHEN g.user_id = ? THEN true
                    WHEN fr.id IS NOT NULL THEN true
                    ELSE false
                END as has_access
                FROM games g
                LEFT JOIN users u ON g.user_id = u.id
                LEFT JOIN friend_relationships fr ON (
                    fr.user_id = ? AND fr.friend_id = g.user_id
                    OR fr.friend_id = ? AND fr.user_id = g.user_id
                )
                WHERE g.gameId = ?";  

        $params = [$user['id'], $user['id'], $user['id'], $gameId];
        $types = 'iiis';

        error_log("searchGames.php - Executing SQL: " . $sql);
        error_log("searchGames.php - Parameters: " . print_r($params, true));

        // Add having clause to only show games user has access to
        $sql .= " HAVING has_access = true";

        // Prepare and execute the statement
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            error_log("searchGames.php - Prepare failed: " . $conn->error);
            throw new Exception("Failed to prepare statement: " . $conn->error);
        }

        $stmt->bind_param($types, ...$params);
        if (!$stmt->execute()) {
            error_log("searchGames.php - Execute failed: " . $stmt->error);
            throw new Exception("Failed to execute statement: " . $stmt->error);
        }

        $result = $stmt->get_result();
        error_log("searchGames.php - Number of rows returned: " . $result->num_rows);
        
        $games = [];
        while ($row = $result->fetch_assoc()) {
            error_log("searchGames.php - Processing row: " . print_r($row, true));
            error_log("searchGames.php - Game creator ID: " . $row['user_id']);
            error_log("searchGames.php - Has access value: " . ($row['has_access'] ? 'true' : 'false'));
            
            // Clean up the response data
            $game = [
                'id' => $row['id'],  // Keep the numeric id
                'gameId' => $row['gameId'],  // Also include the gameId
                'title' => $row['title'],
                'description' => $row['description'],
                'challenges' => json_decode($row['challenge_data'], true),
                'difficulty_level' => $row['difficulty_level'],
                'distance' => $row['stored_distance'],  
                'avg_rating' => $row['avg_rating'],
                'rating_count' => $row['rating_count'],
                'duration' => $row['estimated_time'],
                'tags' => json_decode($row['tags'], true),
                'creator_name' => $row['creator_name'],
                'created_at' => $row['created_at'],
                'image_url' => $row['image_url']
            ];
            $games[] = $game;
            error_log("searchGames.php - Added game to array: " . print_r($game, true));
        }

        error_log("searchGames.php - Final games array: " . print_r($games, true));
        
        echo json_encode([
            'status' => 'success',
            'data' => [
                'games' => $games,
                'total' => count($games),
                'page' => $page,
                'per_page' => $per_page,
                'total_pages' => ceil(count($games) / $per_page)
            ]
        ]);

    } else {
        // Original location-based distance calculation
        if ($latitude !== null && $longitude !== null && $radius !== null) {
            $sql .= ",
                ROUND(
                    ST_Distance_Sphere(
                        point(g.start_longitude, g.start_latitude),
                        point(?, ?)
                    ) * 0.001, 2
                ) as search_distance";  
            $params[] = $longitude;
            $params[] = $latitude;
            $types .= 'dd';
        } else {
            // Set distance to 0 instead of NULL to avoid frontend issues
            $sql .= ", 0 as search_distance";
        }

        // Add relevance score calculation if search is provided
        if ($search) {
            $sql .= ",
                (
                    CASE 
                        -- Exact title match (highest priority)
                        WHEN LOWER(g.title) = LOWER(?) THEN 50
                        -- Title starts with search term (word boundary)
                        WHEN LOWER(g.title) LIKE CONCAT(LOWER(?), '%') THEN 30
                        -- Title contains full word
                        WHEN LOWER(g.title) LIKE CONCAT('% ', LOWER(?), ' %') 
                             OR LOWER(g.title) LIKE CONCAT(LOWER(?), ' %')
                             OR LOWER(g.title) LIKE CONCAT('% ', LOWER(?)) THEN 20
                        -- Similar sounding title (using SOUNDEX)
                        WHEN SOUNDEX(g.title) = SOUNDEX(?) THEN 15
                        ELSE 0
                    END +
                    -- Keywords/tags match (second priority)
                    CASE 
                        WHEN JSON_CONTAINS(g.tags, JSON_ARRAY(?)) THEN 25
                        WHEN g.tags LIKE CONCAT('%\"', LOWER(?), '\"%') THEN 15
                        ELSE 0
                    END +
                    -- Description match (third priority)
                    CASE 
                        WHEN LOWER(g.description) LIKE CONCAT('% ', LOWER(?), ' %') THEN 10
                        ELSE 0
                    END +
                    -- Challenge data match (lowest priority)
                    CASE 
                        WHEN LOWER(g.challenge_data) LIKE CONCAT('%', LOWER(?), '%') THEN 5
                        ELSE 0
                    END
                ) as relevance_score";

            // Add search parameters for relevance calculation
            $params = array_merge($params, [
                $search, // Exact title match
                $search, // Title starts with
                $search, // Title word match 1
                $search, // Title word match 2
                $search, // Title word match 3
                $search, // Soundex match
                $search, // Exact tag match
                $search, // Partial tag match
                $search, // Description match
                $search  // Challenge data match
            ]);
            $types .= str_repeat('s', 10);
        } else {
            $sql .= ", 0 as relevance_score";
        }

        $sql .= " FROM games g
                  LEFT JOIN users u ON g.user_id = u.id
                  WHERE g.is_public = 1";

        // Only apply location filtering if radius is explicitly set
        if ($radius !== null && $latitude !== null && $longitude !== null) {
            $sql .= " AND ST_Distance_Sphere(
                point(g.start_longitude, g.start_latitude),
                point(?, ?)
            ) * 0.001 <= ?";
            $params[] = $longitude;
            $params[] = $latitude;
            $params[] = $radius;
            $types .= 'ddd';
        }

        // Add duration filter
        if ($duration && $duration !== 'any') {
            $duration = intval($duration);
            
            // Add duration condition based on the value
            switch($duration) {
                case 30: // < 30 mins
                    $sql .= " AND g.estimated_time < 30";
                    break;
                case 60: // 30-60 mins
                    $sql .= " AND g.estimated_time >= 30 AND g.estimated_time <= 60";
                    break;
                case 120: // 1-2 hours
                    $sql .= " AND g.estimated_time > 60 AND g.estimated_time <= 120";
                    break;
                case 121: // 2+ hours
                    $sql .= " AND g.estimated_time > 120";
                    break;
            }
        }

        // Add search conditions
        if ($search) {
            
            $sql .= " AND (
                LOWER(g.title) LIKE CONCAT('%', LOWER(?), '%')
                OR g.tags LIKE CONCAT('%', ?, '%')
                OR LOWER(g.description) LIKE CONCAT('%', LOWER(?), '%')
                OR LOWER(g.challenge_data) LIKE CONCAT('%', LOWER(?), '%')
            )";

            // Add parameters for search conditions
            $params = array_merge($params, [
                $search, // Title LIKE
                $search, // Tags
                $search, // Description
                $search  // Challenge data
            ]);
            $types .= str_repeat('s', 4);
        }

        // Add difficulty filter if provided
        if ($difficulty_level) {
            $sql .= " AND g.difficulty_level = ?";
            $params[] = $difficulty_level;
            $types .= 's';
        }

        // Add ordering
        if ($search) {
            // Order by relevance score for search results
            $sql .= " ORDER BY relevance_score DESC, 
                      CASE WHEN LOWER(g.title) LIKE CONCAT('%', LOWER(?), '%') THEN 0 ELSE 1 END,
                      g.created_at DESC";
            $params[] = $search;
            $types .= 's';
        } else {
            // Default ordering when no search
            $sql .= " ORDER BY g.created_at DESC";
        }

        // Add pagination
        $sql .= " LIMIT ? OFFSET ?";
        $params[] = $per_page;
        $params[] = ($page - 1) * $per_page;
        $types .= 'ii';

        // Prepare count query
        $count_sql = "SELECT COUNT(*) as total FROM games g WHERE g.is_public = 1";
        $count_params = [];
        $count_types = '';

        // Add location filter to count query
        if ($radius !== null && $latitude !== null && $longitude !== null) {
            $count_sql .= " AND ST_Distance_Sphere(
                point(g.start_longitude, g.start_latitude),
                point(?, ?)
            ) * 0.001 <= ?";
            $count_params[] = $longitude;
            $count_params[] = $latitude;
            $count_params[] = $radius;
            $count_types .= 'ddd';
        }

        // Add duration filter to count query
        if ($duration && $duration !== 'any') {
            $duration = intval($duration);
            
            // Add duration condition based on the value
            switch($duration) {
                case 30: // < 30 mins
                    $count_sql .= " AND g.estimated_time < 30";
                    break;
                case 60: // 30-60 mins
                    $count_sql .= " AND g.estimated_time >= 30 AND g.estimated_time <= 60";
                    break;
                case 120: // 1-2 hours
                    $count_sql .= " AND g.estimated_time > 60 AND g.estimated_time <= 120";
                    break;
                case 121: // 2+ hours
                    $count_sql .= " AND g.estimated_time > 120";
                    break;
            }
        }

        // Add search conditions to count query
        if ($search) {
            $count_sql .= " AND (
                LOWER(g.title) LIKE CONCAT('%', LOWER(?), '%')
                OR g.tags LIKE CONCAT('%', ?, '%')
                OR LOWER(g.description) LIKE CONCAT('%', LOWER(?), '%')
                OR LOWER(g.challenge_data) LIKE CONCAT('%', LOWER(?), '%')
            )";
            $count_params[] = $search;
            $count_params[] = $search;
            $count_params[] = $search;
            $count_params[] = $search;
            $count_types .= str_repeat('s', 4);
        }

        // Add other filters to count query
        if ($difficulty_level) {
            $count_sql .= " AND g.difficulty_level = ?";
            $count_params[] = $difficulty_level;
            $count_types .= 's';
        }

        // Execute count query first
        $count_stmt = $conn->prepare($count_sql);
        if (!empty($count_params)) {
            $count_stmt->bind_param($count_types, ...$count_params);
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
            error_log("searchGames.php - Processing row: " . print_r($row, true));
            
            // Clean up the response data
            $game = [
                'id' => $row['id'],  // Keep the numeric id
                'gameId' => $row['gameId'],  // Also include the gameId
                'title' => $row['title'],
                'description' => $row['description'],
                'challenges' => json_decode($row['challenge_data'], true),
                'difficulty_level' => $row['difficulty_level'],
                'distance' => $row['stored_distance'],  
                'avg_rating' => $row['avg_rating'],
                'rating_count' => $row['rating_count'],
                'duration' => $row['estimated_time'],
                'tags' => json_decode($row['tags'], true),
                'creator_name' => $row['creator_name'],
                'created_at' => $row['created_at'],
                'image_url' => $row['image_url']
            ];
            $games[] = $game;
            error_log("searchGames.php - Added game to array: " . print_r($game, true));
        }

        error_log("searchGames.php - Final games array: " . print_r($games, true));
        
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

    }

} catch (Exception $e) {
    handleError(500, $e->getMessage(), __FILE__, __LINE__);
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'An error occurred while searching games'
    ]);
}
