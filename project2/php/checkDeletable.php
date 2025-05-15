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

$response = [
    'allowed' => true,
    'name' => '',
    'count' => 0
];

if ($type === "department") {
    // Get name
    $nameStmt = $conn->prepare("SELECT name FROM department WHERE id = ?");
    $nameStmt->bind_param("i", $id);
    $nameStmt->execute();
    $nameResult = $nameStmt->get_result();
    $response['name'] = $nameResult->fetch_assoc()['name'] ?? '';
    $nameStmt->close();

    // Check count
    $stmt = $conn->prepare("SELECT COUNT(*) AS count FROM personnel WHERE departmentID = ?");
    $stmt->bind_param("i", $id);

} elseif ($type === "location") {
    // Get name
    $nameStmt = $conn->prepare("SELECT name FROM location WHERE id = ?");
    $nameStmt->bind_param("i", $id);
    $nameStmt->execute();
    $nameResult = $nameStmt->get_result();
    $response['name'] = $nameResult->fetch_assoc()['name'] ?? '';
    $nameStmt->close();

    // Check count
    $stmt = $conn->prepare("SELECT COUNT(*) AS count FROM department WHERE locationID = ?");
    $stmt->bind_param("i", $id);

} else {
    echo json_encode(['allowed' => false, 'error' => 'Invalid type']);
    exit;
}

$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

$response['count'] = intval($row['count']);
$response['allowed'] = $response['count'] === 0;

$stmt->close();
$conn->close();

echo json_encode($response);
