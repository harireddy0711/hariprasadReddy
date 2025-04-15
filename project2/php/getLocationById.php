<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);
include("config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

$id = $conn->real_escape_string($_GET['id'] ?? '');

$result = $conn->query("SELECT id, name FROM location WHERE id = '$id'");

if ($result && $row = mysqli_fetch_assoc($result)) {
  echo json_encode(['status' => ['code' => '200'], 'data' => $row]);
} else {
  echo json_encode(['status' => ['code' => '404', 'description' => 'Not found'], 'data' => []]);
}

$conn->close();
?>
