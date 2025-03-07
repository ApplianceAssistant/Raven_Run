<?php
/**
 * Cleanup old game images
 * Keep only the current and last 2 previous versions
 */
function cleanupGameImages($gameId) {
    $gameDir = dirname(dirname(dirname(__FILE__))) . '/permanent_uploads/games/' . $gameId;
    $previousDir = $gameDir . '/.previous';
    
    // Skip if directory doesn't exist
    if (!is_dir($previousDir)) {
        return;
    }
    
    // Get all previous versions
    $files = glob($previousDir . '/*_cover.jpg');
    
    // Sort by timestamp (newest first)
    usort($files, function($a, $b) {
        return filemtime($b) - filemtime($a);
    });
    
    // Keep only last 2 previous versions
    for ($i = 2; $i < count($files); $i++) {
        if (file_exists($files[$i])) {
            unlink($files[$i]);
        }
    }
}

/**
 * Save game image with version control
 */
function saveGameImage($gameId, $image_data) {
    $gameDir = dirname(dirname(dirname(__FILE__))) . '/permanent_uploads/games/' . $gameId;
    $previousDir = $gameDir . '/.previous';
    $currentFile = $gameDir . '/cover.jpg';
    
    // Create directories if they don't exist
    if (!file_exists($gameDir)) {
        mkdir($gameDir, 0755, true);
    }
    if (!file_exists($previousDir)) {
        mkdir($previousDir, 0755, true);
    }
    
    // If current image exists, move it to previous versions
    if (file_exists($currentFile)) {
        $timestamp = time();
        rename($currentFile, $previousDir . "/{$timestamp}_cover.jpg");
    }
    
    // Save new image
    file_put_contents($currentFile, $image_data);
    chmod($currentFile, 0644);
    
    // Cleanup old versions
    cleanupGameImages($gameId);
    
    return '/permanent_uploads/games/' . $gameId . '/cover.jpg';
}
