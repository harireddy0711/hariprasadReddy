<?php
header('Content-Type: application/json');

if (!isset($_GET['code'])) {
    echo json_encode(["error" => "Country code is required"]);
    exit;
}

$countryCode = $_GET['code'];
$geoJsonPath = __DIR__ . "/../data/countryBorders.geo.json";

if (!file_exists($geoJsonPath)) {
    echo json_encode(["error" => "GeoJSON file not found"]);
    exit;
}

$geoJson = json_decode(file_get_contents($geoJsonPath), true);
if (!$geoJson || !isset($geoJson['features'])) {
    echo json_encode(["error" => "Invalid GeoJSON data"]);
    exit;
}

foreach ($geoJson['features'] as $feature) {
    if ($feature['properties']['iso_a2'] === $countryCode) {
        echo json_encode($feature);
        exit;
    }
}

echo json_encode(["error" => "Country not found"]);
?>
