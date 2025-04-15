<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);
include("config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
  echo json_encode(['status' => ['code' => '300', 'description' => 'DB unavailable']]);
  exit;
}

$name = $conn->real_escape_string($_POST['name']);

$query = "INSERT INTO location (name) VALUES ('$name')";
$result = $conn->query($query);

if (!$result) {
  echo json_encode(['status' => ['code' => '400', 'description' => 'Insert failed']]);
  exit;
}

echo json_encode(['status' => ['code' => '200', 'description' => 'Location inserted']]);
$conn->close();
?>
