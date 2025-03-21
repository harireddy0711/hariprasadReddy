<?php
header('Content-Type: application/json');

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

$countries = [];
foreach ($geoJson['features'] as $feature) {
    $countries[] = [
        "code" => $feature['properties']['iso_a2'],
        "name" => $feature['properties']['name']
    ];
}

// Sort countries alphabetically
usort($countries, function ($a, $b) {
    return strcmp($a['name'], $b['name']);
});

echo json_encode($countries);
?>
