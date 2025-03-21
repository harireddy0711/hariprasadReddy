<?php
header('Content-Type: application/json');

if (!isset($_GET['code'])) {
    echo json_encode(["error" => "No country code provided"]);
    exit;
}

$countryCode = strtoupper($_GET['code']);

// Fetch basic country data
$countryData = json_decode(file_get_contents("https://restcountries.com/v3.1/alpha/" . $countryCode), true);

// Fetch country border from GeoJSON
$geoJsonPath = __DIR__ . "/../data/countryBorders.geo.json";
if (!file_exists($geoJsonPath)) {
    echo json_encode(["error" => "GeoJSON file not found"]);
    exit;
}

$geoJson = json_decode(file_get_contents($geoJsonPath), true);
if (!$geoJson) {
    echo json_encode(["error" => "Invalid GeoJSON data"]);
    exit;
}

$borderData = null;
foreach ($geoJson['features'] as $feature) {
    if ($feature['properties']['iso_a2'] === $countryCode) {
        $borderData = $feature['geometry'];
        break;
    }
}

$response = [
    "countryInfo" => $countryData[0] ?? null,
    "border" => $borderData
];

echo json_encode($response);
?>
