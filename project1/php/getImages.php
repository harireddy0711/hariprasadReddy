<?php
header("Content-Type: application/json");

$accessKey = "OHqb5Y819w6kEn-QuefFHfluJQFWfOtW2aRSuuYiPHI";

if (!isset($_GET['country']) || empty($_GET['country'])) {
    echo json_encode(["error" => "No country specified"]);
    exit;
}

$country = urlencode($_GET['country']);
$api_url = "https://api.unsplash.com/search/photos?query=$country&client_id=$accessKey&per_page=6";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

if (!$response) {
    echo json_encode(["error" => "Failed to fetch images"]);
    exit;
}

$data = json_decode($response, true);
$imageUrls = [];

foreach ($data['results'] as $image) {
    $imageUrls[] = $image['urls']['regular'];
}

echo json_encode($imageUrls);
?>
