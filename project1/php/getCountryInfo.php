<?php
header("Content-Type: application/json");

$country = $_GET['country'] ?? '';

if (!$country) {
  echo json_encode(["error" => "No country provided"]);
  exit;
}

// Encode country for safe URL use
$code = $_GET['country'] ?? '';
$encoded = rawurlencode($code);
$url = "https://restcountries.com/v3.1/alpha/$encoded";




// Use cURL to handle errors better
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);

if (curl_errno($ch)) {
  echo json_encode(["error" => "Request error: " . curl_error($ch)]);
  curl_close($ch);
  exit;
}

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
  echo json_encode(["error" => "Country not found or API error"]);
  exit;
}

$data = json_decode($response, true);

if (!is_array($data) || empty($data[0])) {
  echo json_encode(["error" => "Unexpected data format"]);
  exit;
}

$info = $data[0];

echo json_encode([
  "name" => $info['name']['common'] ?? $country,
  "capital" => $info['capital'][0] ?? 'N/A',
  "population" => $info['population'] ?? 0,
  "currency" => isset($info['currencies']) ? implode(', ', array_keys($info['currencies'])) : 'N/A',
  "languages" => isset($info['languages']) ? implode(', ', $info['languages']) : 'N/A',
  "continent" => $info['continents'][0] ?? 'N/A',
  "area" => $info['area'] ?? 0,
  "flag" => $info['flags']['png'] ?? ''
]);
?>
