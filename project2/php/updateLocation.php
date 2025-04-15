<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);
include("config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

$id = $conn->real_escape_string($_POST['id']);
$name = $conn->real_escape_string($_POST['name']);

$query = "UPDATE location SET name='$name' WHERE id='$id'";
$result = $conn->query($query);

if ($result) {
  echo json_encode(['status' => ['code' => '200', 'description' => 'updated']]);
} else {
  echo json_encode(['status' => ['code' => '500', 'description' => 'update failed']]);
}

$conn->close();
?>
