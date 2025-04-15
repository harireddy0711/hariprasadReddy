<?php

// Display errors during development (remove for production)
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include("config.php");


header('Content-Type: application/json; charset=UTF-8');

// Create DB connection
$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    $output['data'] = [];
    echo json_encode($output);
    exit;
}

// Retrieve and sanitize input
$firstName     = $conn->real_escape_string($_POST['firstName']);
$lastName      = $conn->real_escape_string($_POST['lastName']);
$email         = $conn->real_escape_string($_POST['email']);
$jobTitle      = $conn->real_escape_string($_POST['jobTitle']);
$departmentID  = $conn->real_escape_string($_POST['departmentID']);

// Insert query
$query = "INSERT INTO personnel (firstName, lastName, email, jobTitle, departmentID) 
          VALUES ('$firstName', '$lastName', '$email', '$jobTitle', '$departmentID')";

$result = $conn->query($query);

if (!$result) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "query failed";
    $output['data'] = [];
    echo json_encode($output);
    exit;
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "inserted successfully";
$output['data'] = [];

$conn->close();

echo json_encode($output);

?>
