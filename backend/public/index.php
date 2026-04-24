<?php
/**
 * API Router - Redirects to original backend
 * This file acts as a bridge to the original PHP backend located in the parent directory
 */

// Get the original backend path (two levels up)
$originalBackend = dirname(dirname(dirname(dirname(__FILE__)))) . '/public/index.php';

// Check if original backend exists
if (file_exists($originalBackend)) {
    // Include the original backend
    require $originalBackend;
} else {
    // If backend not found, show error
    http_response_code(500);
    echo json_encode([
        'error' => 'Backend configuration error',
        'message' => 'Original backend files not found at expected location'
    ]);
    exit;
}
?>
