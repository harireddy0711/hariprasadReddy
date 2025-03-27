<?php
header("Content-Type: application/json");

$countryCode = $_GET['code'] ?? '';
if (!$countryCode) {
    echo json_encode(["error" => "No country code provided"]);
    exit;
}

$username = "harireddy";
$maxRows = 50;
$featureClass = "S";
$featureCode = "AIRP";
$url = "http://api.geonames.org/searchJSON?country=$countryCode&featureClass=$featureClass&featureCode=$featureCode&maxRows=$maxRows&username=$username";

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

$airports = [];
foreach ($data['geonames'] as $airport) {
    $airports[] = [
        "name" => $airport['name'] ?? '',
        "lat" => $airport['lat'] ?? 0,
        "lng" => $airport['lng'] ?? 0
    ];
}

echo json_encode($airports);
?>
