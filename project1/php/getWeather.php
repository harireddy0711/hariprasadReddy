<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");

// Your OpenWeatherMap API key
$apiKey = "ca1cb03649402b80770e2e5cfc7b425b";

function fetchApi($url) {
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_FAILONERROR => true,
    CURLOPT_SSL_VERIFYPEER => false,  // 👈 avoid SSL issues locally
    CURLOPT_HTTPHEADER => [
      "Accept: application/json"
    ],
    CURLOPT_USERAGENT => "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
  ]);

  $response = curl_exec($ch);
  $error = curl_error($ch);
  curl_close($ch);

  if ($response === false) {
    return ["error" => "cURL Error: $error", "url" => $url];
  }

  return json_decode($response, true);
}


// Step 1: Get country code from query
$countryCode = $_GET['code'] ?? '';
if (!$countryCode) {
  echo json_encode(["error" => "No country code provided"]);
  exit;
}

// Step 2: Get capital and country name from REST Countries
$countryUrl = "https://restcountries.com/v3.1/alpha/" . urlencode($countryCode);
$countryData = fetchApi($countryUrl);

if (isset($countryData["error"]) || !isset($countryData[0])) {
  echo json_encode(["error" => "Failed to fetch country info", "details" => $countryData["error"] ?? null]);
  exit;
}

$capital = $countryData[0]['capital'][0] ?? null;
$countryName = $countryData[0]['name']['common'] ?? null;

if (!$capital || !$countryName) {
  echo json_encode(["error" => "Capital or country name not found"]);
  exit;
}

// Step 3: Get current weather (also gives us coordinates)
$weatherQuery = urlencode("$capital, $countryName");
$currentUrl = "https://api.openweathermap.org/data/2.5/weather?q=$weatherQuery&appid=$apiKey&units=metric";
$currentData = fetchApi($currentUrl);

if (isset($currentData["error"]) || ($currentData['cod'] ?? 0) != 200) {
  echo json_encode(["error" => "Current weather not available", "message" => $currentData['message'] ?? null]);
  exit;
}

$lat = $currentData['coord']['lat'] ?? null;
$lon = $currentData['coord']['lon'] ?? null;

if (!$lat || !$lon) {
  echo json_encode(["error" => "Coordinates missing in weather data"]);
  exit;
}

// Step 4: Get 3-day forecast using 5-day forecast API (every 3h)
$forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q=$weatherQuery&appid=$apiKey&units=metric";
$forecastData = fetchApi($forecastUrl);

$forecast = [];
if (isset($forecastData['list'])) {
  $daily = [];

  foreach ($forecastData['list'] as $item) {
    $date = substr($item['dt_txt'], 0, 10);
    $daily[$date][] = $item;
  }

  $count = 0;
  foreach ($daily as $date => $entries) {
    if ($count++ >= 3) break;

    $temps = array_column(array_column($entries, 'main'), 'temp');
    $icons = array_column(array_column($entries, 'weather'), 0);

    $forecast[] = [
      "date" => $date,
      "max" => max($temps),
      "min" => min($temps),
      "icon" => "http://openweathermap.org/img/w/" . $icons[0]['icon'] . ".png"
    ];
  }
}

// Final JSON response
echo json_encode([
  "city" => $capital,
  "temperature" => $currentData['main']['temp'],
  "description" => $currentData['weather'][0]['description'],
  "humidity" => $currentData['main']['humidity'],
  "windSpeed" => $currentData['wind']['speed'],
  "icon" => "http://openweathermap.org/img/w/" . $currentData['weather'][0]['icon'] . ".png",
  "forecast" => $forecast
]);
