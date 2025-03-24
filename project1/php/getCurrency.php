<?php
header("Content-Type: application/json");

$apiKey = "8cada1149e7f369ef2ed6c7a"; 
$countryCode = $_GET['code'] ?? '';

if (!$countryCode) {
    echo json_encode(["error" => "Missing country code"]);
    exit;
}

// Fetch country data from RestCountries API
$countryInfoUrl = "https://restcountries.com/v3.1/alpha/$countryCode";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $countryInfoUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$countryResponse = curl_exec($ch);
curl_close($ch);
$countryData = json_decode($countryResponse, true);

if (!$countryData || empty($countryData[0]['currencies'])) {
    echo json_encode(["error" => "Currency not found"]);
    exit;
}

// Get currency code (e.g., USD, EUR, GBP)
$currencyCode = array_keys($countryData[0]['currencies'])[0];

// Fetch exchange rate
$exchangeUrl = "https://v6.exchangerate-api.com/v6/$apiKey/latest/USD";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $exchangeUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$exchangeResponse = curl_exec($ch);
curl_close($ch);
$exchangeData = json_decode($exchangeResponse, true);

$exchangeRate = $exchangeData['conversion_rates'][$currencyCode] ?? "N/A";

echo json_encode([
    "currency" => $currencyCode,
    "exchangeRate" => $exchangeRate
]);
?>
