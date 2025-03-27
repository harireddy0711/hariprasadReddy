<?php
header("Content-Type: application/json");

$countryCode = $_GET['code'] ?? '';
if (!$countryCode) {
    echo json_encode(["error" => "No country code provided"]);
    exit;
}

$username = "harireddy";
$maxRows = 50;
$featureClass = "P";
$url = "http://api.geonames.org/searchJSON?country=$countryCode&featureClass=$featureClass&maxRows=$maxRows&username=$username";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
if (!isset($data['geonames'])) {
    echo json_encode(["error" => "No data found", "response" => $data]);
    exit;
}

$markers = [];
foreach ($data['geonames'] as $place) {
    $markers[] = [
        "name" => $place['name'] ?? '',
        "lat" => $place['lat'] ?? 0,
        "lng" => $place['lng'] ?? 0,
        "population" => $place['population'] ?? 0
    ];
}

echo json_encode($markers);
?>
