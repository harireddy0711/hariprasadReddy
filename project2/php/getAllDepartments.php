<?php

// Enable error reporting for development
ini_set('display_errors', 'On');
error_reporting(E_ALL);

include("config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    echo json_encode([
        'status' => ['code' => '300', 'name' => 'failure', 'description' => 'database unavailable'],
        'data' => []
    ]);
    exit;
}

// Updated query to join with location table
$query = 'SELECT d.id, d.name, d.locationID, l.name AS locationName 
          FROM department d 
          LEFT JOIN location l ON d.locationID = l.id';

$result = $conn->query($query);

if (!$result) {
    echo json_encode([
        'status' => ['code' => '400', 'name' => 'executed', 'description' => 'query failed'],
        'data' => []
    ]);
    exit;
}

$data = [];

while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}

echo json_encode([
    'status' => ['code' => '200', 'name' => 'ok', 'description' => 'success'],
    'data' => $data
]);

$conn->close();
?>
