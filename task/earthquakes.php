<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

$geonames_username = "harireddy";
$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['north'], $input['south'], $input['east'], $input['west'])) {
    echo json_encode(["error" => "All coordinates (north, south, east, west) are required"]);
    exit;
}

$api_url = "http://api.geonames.org/earthquakesJSON?north={$input['north']}&south={$input['south']}&east={$input['east']}&west={$input['west']}&username=$geonames_username";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
