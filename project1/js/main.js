$(document).ready(function () {
    var map = L.map('map').setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
    }).addTo(map);

    // Load countries and sort alphabetically
    $.getJSON("php/getCountries.php", function (data) {
        data.sort((a, b) => a.name.localeCompare(b.name));
        $.each(data, function (key, value) {
            $("#countrySelect").append('<option value="' + value.code + '">' + value.name + '</option>');
        });
    });

    // Handle country selection
    $("#countrySelect").on("change", function () {
        var countryCode = $(this).val();
        if (countryCode) {
            $.getJSON("php/getCountryData.php?code=" + countryCode, function (data) {
                map.eachLayer(function (layer) {
                    if (!!layer.toGeoJSON) {
                        map.removeLayer(layer);
                    }
                });

                var countryLayer = L.geoJSON(data, { color: "red" }).addTo(map);
                map.fitBounds(countryLayer.getBounds());
            });
        }
    });
     // wiki
    $(document).ready(function () {
        $("#infoButton").on("click", function () {
            var countryName = $("#countrySelect option:selected").text();
            if (!countryName) return;
    
            $.getJSON("php/getWiki.php?country=" + countryName, function (data) {
                if (data.error) {
                    $("#wikiModalBody").html("<p>No data found.</p>");
                } else {
                    $("#wikiModalTitle").text(data.title);
                    $("#wikiModalBody").html(`
                        <img src="${data.image}" class="img-fluid mb-2">
                        <p>${data.summary}</p>
                    `);
                }
                $("#wikiModal").modal("show");
            });
        });
    });

      //currency
    
        $("#currencyButton").on("click", function () {
            var countryCode = $("#countrySelect").val();
            if (!countryCode) return;
    
            $.getJSON(`php/getCurrency.php?code=${countryCode}`, function (data) {
                $("#currencyCode").text(data.currency);
                $("#exchangeRate").text(data.exchangeRate);
            }).fail(function () {
                $("#currencyModalBody").html("<p>Failed to fetch currency data.</p>");
            });
    
            $("#currencyModal").modal("show");
        });
    //images
        $("#imagesButton").on("click", function () {
            var countryName = $("#countrySelect option:selected").text();
            if (!countryName) return;
    
            $.getJSON(`php/getImages.php?country=${countryName}`, function (data) {
                let imgHtml = data.map(img => `<img src="${img}" class="img-fluid mb-2 rounded" style="width: 100%;">`).join('');
                $("#imagesModalBody").html(imgHtml);
            }).fail(function () {
                $("#imagesModalBody").html("<p>No images found.</p>");
            });
    
            $("#imagesModal").modal("show");
        });

        //weather
        $("#weatherButton").on("click", function () {
            var countryCode = $("#countrySelect").val();
            if (!countryCode) {
                alert("Please select a country first.");
                return;
            }
        
            console.log("Fetching weather for:", countryCode);
        
            $.getJSON(`php/getWeather.php?code=${countryCode}`, function (data) {
                console.log("Weather API Response:", data); 
        
                if (data.error) {
                    $("#weatherModalBody").html("<p>Error fetching weather data.</p>");
                } else {
                    $("#weatherCity").text(data.city);
                    $("#weatherTemp").text(data.temperature + "°C");
                    $("#weatherDescription").text(data.description);
                    $("#weatherHumidity").text(data.humidity + "%");
                    $("#weatherWind").text(data.windSpeed + " km/h");
                    $("#weatherIcon").attr("src", data.icon).show();
                }
            }).fail(function () {
                $("#weatherModalBody").html("<p>Failed to fetch weather data.</p>");
            });
        
            $("#weatherModal").modal("show");
        });
        
    
    
    
    
    

 
    

    
      
   
      
});
