<?php
file_put_contents("debug_delete.log", print_r($_POST, true));

ini_set('display_errors', 'On');
error_reporting(E_ALL);

include("config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    echo json_encode($output);
    exit;
}

if (!isset($_POST['id']) || !is_numeric($_POST['id'])) {
    echo json_encode([
        'status' => ['code' => '400', 'name' => 'failed', 'description' => 'ID is missing or invalid'],
        'data' => []
    ]);
    exit;
}

$id = $conn->real_escape_string($_POST['id']);



$query = "DELETE FROM personnel WHERE id = '$id'";
$result = $conn->query($query);

if (!$result) {
    echo json_encode([
        'status' => ['code' => '500', 'name' => 'failed', 'description' => $conn->error],
        'data' => []
    ]);
    exit;
}

echo json_encode([
    'status' => ['code' => '200', 'name' => 'ok', 'description' => 'deleted'],
    'data' => []
]);

$conn->close();
?>
