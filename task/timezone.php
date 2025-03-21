<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

$geonames_username = "harireddy";
$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['lat'], $input['lng'])) {
    echo json_encode(["error" => "Latitude and Longitude are required"]);
    exit;
}

$api_url = "http://api.geonames.org/timezoneJSON?lat={$input['lat']}&lng={$input['lng']}&username=$geonames_username";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
