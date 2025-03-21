function fetchData(apiType) {
    let fetchUrl = "";
    let params = {};

    if (apiType === "cities") {
        params.param = document.getElementById("citiesInput").value;
        fetchUrl = "cities.php";
    } else if (apiType === "earthquakes") {
        params.north = document.getElementById("north").value;
        params.south = document.getElementById("south").value;
        params.east = document.getElementById("east").value;
        params.west = document.getElementById("west").value;
        fetchUrl = "earthquakes.php";
    } else if (apiType === "timezone") {
        params.lat = document.getElementById("timezoneLat").value;
        params.lng = document.getElementById("timezoneLng").value;
        fetchUrl = "timezone.php";
    }

    if (!fetchUrl) {
        console.error("Invalid API selection");
        return;
    }

    fetch(fetchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
    })
    .then(response => response.json())
    .then(data => displayResults(apiType, data))
    .catch(error => {
        console.error("Fetch error:", error);
        document.getElementById("output").innerHTML = "<p style='color:red;'>Error fetching data.</p>";
    });
}

function displayResults(api, data) {
    let outputDiv = document.getElementById("output");
    outputDiv.innerHTML = "";

    if (data.error) {
        outputDiv.innerHTML = `<p style='color:red;'>${data.error}</p>`;
        return;
    }

    let resultHTML = "<ul>";
    if (api === "cities") {
        data.geonames.forEach(city => {
            resultHTML += `<li>${city.name}, ${city.countryName}</li>`;
        });
    } else if (api === "earthquakes") {
        data.earthquakes.forEach(eq => {
            resultHTML += `<li>Magnitude: ${eq.magnitude}, Location: (${eq.lat}, ${eq.lng})</li>`;
        });
    } else if (api === "timezone") {
        resultHTML += `<li>Timezone: ${data.timezoneId}, GMT Offset: ${data.gmtOffset}</li>`;
    }
    resultHTML += "</ul>";

    outputDiv.innerHTML = resultHTML;
}
