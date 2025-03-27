<?php
header("Content-Type: application/json");

$country = $_GET['country'] ?? '';
if (!$country) {
  echo json_encode(["error" => "No country provided"]);
  exit;
}

// Convert spaces to underscores instead of urlencode
$query = str_replace(' ', '_', $country);
$url = "https://en.wikipedia.org/api/rest_v1/page/summary/$query";

$response = @file_get_contents($url);
if ($response === FALSE) {
  echo json_encode(["error" => "Failed to fetch Wikipedia data"]);
  exit;
}

$data = json_decode($response, true);
if (!isset($data['title'])) {
  echo json_encode(["error" => "No Wikipedia article found"]);
  exit;
}

echo json_encode([
  "title" => $data['title'] ?? $country,
  "summary" => $data['extract'] ?? "No summary found.",
  "image" => $data['thumbnail']['source'] ?? "",
  "url" => $data['content_urls']['desktop']['page'] ?? "https://en.wikipedia.org/wiki/$query"
]);
?>
