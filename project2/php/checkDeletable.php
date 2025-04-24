<?php
include("config.php");
header('Content-Type: application/json; charset=UTF-8');

$type = $_REQUEST['type'] ?? '';
$id = intval($_REQUEST['id'] ?? 0);

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if ($conn->connect_error) {
    echo json_encode(['allowed' => false, 'error' => 'Database connection failed']);
    exit;
}

$allowed = true;

if ($type === "department") {
    $stmt = $conn->prepare("SELECT COUNT(*) AS count FROM personnel WHERE departmentID = ?");
    $stmt->bind_param("i", $id);
} elseif ($type === "location") {
    $stmt = $conn->prepare("SELECT COUNT(*) AS count FROM department WHERE locationID = ?");
    $stmt->bind_param("i", $id);
} else {
    echo json_encode(['allowed' => false, 'error' => 'Invalid type']);
    exit;
}

$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

if ($row['count'] > 0) {
    $allowed = false;
}

$stmt->close();
$conn->close();

echo json_encode(['allowed' => $allowed]);
