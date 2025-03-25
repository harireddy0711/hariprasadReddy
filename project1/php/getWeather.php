<?php
header("Content-Type: application/json");

$apiKey = "ca1cb03649402b80770e2e5cfc7b425b";
$countryCode = $_GET['code'] ?? '';

if (!$countryCode) {
    echo json_encode(["error" => "No country code provided"]);
    exit;
}

$countryInfoUrl = "https://restcountries.com/v3.1/alpha/$countryCode";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $countryInfoUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$countryResponse = curl_exec($ch);
curl_close($ch);
$countryData = json_decode($countryResponse, true);

if (!$countryData || empty($countryData[0]['capital'])) {
    echo json_encode(["error" => "Capital not found for this country"]);
    exit;
}

$capitalCity = $countryData[0]['capital'][0];
$weatherUrl = "https://api.openweathermap.org/data/2.5/weather?q=$capitalCity&appid=$apiKey&units=metric";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $weatherUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$weatherResponse = curl_exec($ch);
curl_close($ch);
$weatherData = json_decode($weatherResponse, true);

if (!$weatherData || isset($weatherData['cod']) && $weatherData['cod'] != 200) {
    echo json_encode(["error" => "Weather data not available"]);
    exit;
}

$result = [
    "city" => $capitalCity,
    "temperature" => $weatherData['main']['temp'],
    "description" => $weatherData['weather'][0]['description'],
    "humidity" => $weatherData['main']['humidity'],
    "windSpeed" => $weatherData['wind']['speed'],
    "icon" => "http://openweathermap.org/img/w/" . $weatherData['weather'][0]['icon'] . ".png"
];

echo json_encode($result);
?>
