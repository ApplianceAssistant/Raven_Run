<?php

/**
 * Convert radius based on user's unit preference
 * @param float|int $radius The radius value
 * @param bool $isMetric Whether the user is using metric units
 * @param bool $toStorage If true, converts from display units to storage units (meters)
 *                       If false, converts from storage units (meters) to display units
 * @return float|int The converted radius value, rounded to nearest whole number
 */
function convertRadius($radius, $isMetric, $toStorage = true) {
    if ($radius === null || $radius === '') {
        return $radius;
    }

    // If metric, no conversion needed, just round
    if ($isMetric) {
        return round($radius);
    }

    // Convert between feet and meters
    if ($toStorage) {
        // Convert from feet to meters for storage
        return round($radius * 0.3048);
    } else {
        // Convert from meters to feet for display
        return round($radius * 3.28084);
    }
}
