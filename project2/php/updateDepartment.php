<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);
include("config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);
if (mysqli_connect_errno()) {
    echo json_encode(['status' => ['code' => '300', 'description' => 'Database unavailable'], 'data' => []]);
    exit;
}

$id = $conn->real_escape_string($_POST['id']);
$name = $conn->real_escape_string($_POST['name']);
$locationID = $conn->real_escape_string($_POST['locationID']);

$query = "UPDATE department SET name='$name', locationID='$locationID' WHERE id='$id'";
$result = $conn->query($query);

if (!$result) {
    echo json_encode(['status' => ['code' => '400', 'description' => 'Query failed'], 'data' => []]);
    exit;
}

echo json_encode(['status' => ['code' => '200', 'description' => 'Department updated'], 'data' => []]);
$conn->close();
?>
