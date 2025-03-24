<?php
header('Content-Type: application/json');

if (!isset($_GET['country'])) {
    echo json_encode(["error" => "Country name is required"]);
    exit;
}

$country = urlencode($_GET['country']);
$url = "https://en.wikipedia.org/api/rest_v1/page/summary/$country";

$response = file_get_contents($url);
if ($response === FALSE) {
    echo json_encode(["error" => "Failed to fetch data"]);
    exit;
}

$data = json_decode($response, true);
if (isset($data['extract']) && isset($data['thumbnail']['source'])) {
    echo json_encode([
        "title" => $data['title'],
        "summary" => $data['extract'],
        "image" => $data['thumbnail']['source']
    ]);
} else {
    echo json_encode(["error" => "No Wikipedia data found"]);
}
?>
