<?php
header('Content-Type: application/json; charset=UTF-8');
file_put_contents("log.txt", json_encode($_POST));

include("config.php");

// Retrieve raw POST data and parse into $_POST if necessary
if ($_SERVER["REQUEST_METHOD"] === "POST" && empty($_POST)) {
    parse_str(file_get_contents("php://input"), $_POST);
}

if (!isset($_POST['id']) || !is_numeric($_POST['id'])) {
    echo json_encode([
        "status" => [
            "code" => 400,
            "name" => "bad request",
            "description" => "missing personnel ID"
        ]
    ]);
    exit;
}

$personnelId = intval($_POST['id']);

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if ($conn->connect_error) {
    echo json_encode([
        "status" => [
            "code" => 500,
            "name" => "database error",
            "description" => $conn->connect_error
        ]
    ]);
    exit;
}

$stmt = $conn->prepare("DELETE FROM personnel WHERE id = ?");
$stmt->bind_param("i", $personnelId);

if ($stmt->execute()) {
    echo json_encode([
        "status" => [
            "code" => 200,
            "name" => "ok",
            "description" => "personnel deleted"
        ]
    ]);
} else {
    echo json_encode([
        "status" => [
            "code" => 500,
            "name" => "error",
            "description" => "deletion failed"
        ]
    ]);
}

$stmt->close();
$conn->close();
?>
