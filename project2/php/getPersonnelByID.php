<?php

$executionStartTime = microtime(true);
include("config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    $output['data'] = [];
    echo json_encode($output);
    exit;
}

$id = $_REQUEST['id'] ?? null;

if (!$id) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "bad request";
    $output['status']['description'] = "Missing personnel ID";
    echo json_encode($output);
    exit;
}

$query = $conn->prepare('SELECT id, firstName, lastName, email, jobTitle, departmentID FROM personnel WHERE id = ?');
$query->bind_param("i", $id);
$query->execute();

$result = $query->get_result();
$person = $result->fetch_assoc();

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $person;

$conn->close();
echo json_encode($output);
?>
