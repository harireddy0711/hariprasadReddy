<?php
if (!isset($_GET['lat']) || !isset($_GET['lon'])) {
  echo json_encode(["error" => "Missing coordinates"]);
  exit;
}

$lat = $_GET['lat'];
$lon = $_GET['lon'];

$url = "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=$lat&lon=$lon";

// Add user-agent to avoid being blocked
$options = [
  "http" => [
    "header" => "User-Agent: Gazetteer-App/1.0\r\n"
  ]
];
$context = stream_context_create($options);

$response = file_get_contents($url, false, $context);
if ($response === false) {
  echo json_encode(["error" => "Failed to fetch geolocation"]);
} else {
  echo $response;
}
