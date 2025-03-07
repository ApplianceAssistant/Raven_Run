<?php
require_once __DIR__ . '/../utils/db_connection.php';
require_once __DIR__ . '/../utils/errorHandler.php';

// First, run the Node.js script to convert the data
echo "Converting TypeScript data to JSON...\n";
$scriptPath = escapeshellarg(__DIR__ . '/convert_challenges.js');
exec("node $scriptPath", $output, $returnVar);

if ($returnVar !== 0) {
    echo "Failed to convert data. Error:\n";
    print_r($output);
    exit(1);
}

echo "Reading JSON data...\n";
$jsonFile = __DIR__ . '/games.json';
if (!file_exists($jsonFile)) {
    echo "JSON file not found\n";
    exit(1);
}

$jsonData = file_get_contents($jsonFile);
$games = json_decode($jsonData, true);

if (!$games) {
    echo "Failed to parse JSON data. Error: " . json_last_error_msg() . "\n";
    exit(1);
}

echo "Successfully loaded " . count($games) . " games\n";

// Update each game in the database
$conn = getDbConnection();
if (!$conn) {
    echo "Failed to connect to database\n";
    exit(1);
}

foreach ($games as $game) {
    if (!isset($game['gameId'])) {
        echo "Skipping game without gameId\n";
        continue;
    }
    
    $gameId = $game['gameId'];
    // Only store the challenges array in challenge_data
    $challengeData = json_encode($game['challenges'] ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    
    if ($challengeData === false) {
        echo "Failed to encode game data for game: $gameId\n";
        continue;
    }
    
    $stmt = $conn->prepare("UPDATE games SET challenge_data = ? WHERE gameId = ?");
    if (!$stmt) {
        echo "Prepare failed: " . $conn->error . "\n";
        continue;
    }
    
    $stmt->bind_param("ss", $challengeData, $gameId);
    
    if (!$stmt->execute()) {
        echo "Execute failed: " . $stmt->error . " for game: $gameId\n";
    } else {
        echo "Successfully updated challenges for game: $gameId\n";
    }
    
    $stmt->close();
}

echo "Challenge data update completed!\n";

// Clean up the temporary JSON file
unlink($jsonFile);

releaseDbConnection();
?>
