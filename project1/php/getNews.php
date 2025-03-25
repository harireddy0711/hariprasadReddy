<?php
header("Content-Type: application/json");

$apiKey = "777406f21c0b4706b19c43c569ea5c75";
$countryName = trim($_GET['country'] ?? '');

if (!$countryName) {
    echo json_encode(["error" => "No country specified"]);
    exit;
}

$newsUrl = "https://newsapi.org/v2/everything?q=" . urlencode($countryName) .
           "&sortBy=publishedAt&language=en&pageSize=5&apiKey=$apiKey";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $newsUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "User-Agent: GazetteerProject/1.0"
]);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);

if (!isset($data['articles']) || empty($data['articles'])) {
    echo json_encode(["error" => "No news found", "raw" => $data]);
    exit;
}

$headlines = [];
foreach ($data['articles'] as $article) {
    $headlines[] = [
        "title" => $article['title'] ?? "No Title",
        "description" => $article['description'] ?? "",
        "url" => $article['url'] ?? "#",
        "source" => $article['source']['name'] ?? "Unknown",
        "publishedAt" => $article['publishedAt'] ?? ""
    ];
}

echo json_encode($headlines);
?>
