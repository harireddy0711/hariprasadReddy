<?php
header("Content-Type: application/json");

$apiKey = "8cada1149e7f369ef2ed6c7a"; // Your ExchangeRate-API key
$countryCode = $_GET['code'] ?? '';

if (!$countryCode) {
    echo json_encode(["error" => "Missing country code"]);
    exit;
}

// Get the base currency of the selected country
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

$currencyCode = array_keys($countryData[0]['currencies'])[0]; // e.g., INR for India

// Now fetch exchange rates FROM that currency to others
$exchangeUrl = "https://v6.exchangerate-api.com/v6/$apiKey/latest/$currencyCode";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $exchangeUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$exchangeResponse = curl_exec($ch);
curl_close($ch);

$exchangeData = json_decode($exchangeResponse, true);
if (!$exchangeData || $exchangeData['result'] !== 'success') {
    echo json_encode(["error" => "Exchange rate fetch failed"]);
    exit;
}

// Success response
echo json_encode([
    "currency" => $currencyCode,
    "rates" => $exchangeData['conversion_rates'], // Rates from selected country's currency TO others
    "updated" => date("D M d Y - H:i")
]);
?>
