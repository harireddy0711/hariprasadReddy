<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

include("config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    echo json_encode([
        'status' => ['code' => '300', 'name' => 'failed', 'description' => 'DB connection error'],
        'data' => []
    ]);
    exit;
}

$query = "SELECT id, name FROM location ORDER BY name";
$result = $conn->query($query);

$locations = [];

while ($row = mysqli_fetch_assoc($result)) {
    $locations[] = $row;
}

echo json_encode([
    'status' => ['code' => '200', 'name' => 'ok', 'description' => 'locations loaded'],
    'data' => $locations
]);

$conn->close();
?>
