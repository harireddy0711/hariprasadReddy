<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include("config.php");

header('Content-Type: application/json; charset=UTF-8');

// Connect to the database
$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

// Check connection
if (mysqli_connect_errno()) {
    echo json_encode([
        "status" => [
            "code" => "300",
            "name" => "failure",
            "description" => "database unavailable",
            "returnedIn" => (microtime(true) - $executionStartTime) / 1000 . " ms"
        ],
        "data" => []
    ]);
    exit;
}

// ✅ IMPORTANT: Include `p.id` in the SELECT
$query = 'SELECT 
    p.id, 
    p.lastName, 
    p.firstName, 
    p.jobTitle, 
    p.email, 
    d.name AS department, 
    l.name AS location 
FROM personnel p 
LEFT JOIN department d ON d.id = p.departmentID 
LEFT JOIN location l ON l.id = d.locationID 
ORDER BY p.lastName, p.firstName';

$result = $conn->query($query);

if (!$result) {
    echo json_encode([
        "status" => [
            "code" => "400",
            "name" => "executed",
            "description" => "query failed"
        ],
        "data" => []
    ]);
    $conn->close();
    exit;
}

// Collect results
$data = [];
while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}

$conn->close();

echo json_encode([
    "status" => [
        "code" => "200",
        "name" => "ok",
        "description" => "success",
        "returnedIn" => (microtime(true) - $executionStartTime) / 1000 . " ms"
    ],
    "data" => $data
]);
?>
