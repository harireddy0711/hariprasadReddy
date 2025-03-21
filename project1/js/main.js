var map;
var countryBorderLayer;

$(document).ready(function () {
    console.log("Initializing application...");

    // Initialize Leaflet map
    map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Fetch and populate country list
    $.ajax({
        url: "php/getCountries.php",
        type: "GET",
        dataType: "json",
        success: function (data) {
            console.log("Countries Loaded:", data);
            if (data.error) {
                console.error("Error fetching countries:", data.error);
                return;
            }
            // Sort countries alphabetically
            data.sort((a, b) => a.name.localeCompare(b.name));
            $("#countrySelect").empty().append('<option value="">Select a Country</option>');
            $.each(data, function (key, value) {
                $("#countrySelect").append('<option value="' + value.code + '">' + value.name + '</option>');
            });
        },
        error: function (xhr, status, error) {
            console.error("Error fetching country list:", error);
        }
    });

    // Handle country selection
    $("#countrySelect").on("change", function () {
        var countryCode = $(this).val();
        if (countryCode) {
            console.log("Selected country:", countryCode);
            $.ajax({
                url: "php/getCountryData.php",
                type: "GET",
                data: { code: countryCode },
                dataType: "json",
                success: function (data) {
                    console.log("Country Data:", data);

                    if (data.error) {
                        console.error("Error:", data.error);
                        return;
                    }

                    // Remove existing border layer
                    if (countryBorderLayer) {
                        map.removeLayer(countryBorderLayer);
                    }

                    // Add country border
                    if (data.border) {
                        console.log("Adding border...");
                        countryBorderLayer = L.geoJSON(data.border, {
                            style: {
                                color: "red",
                                weight: 2
                            }
                        }).addTo(map);
                        map.fitBounds(countryBorderLayer.getBounds());
                    }
                },
                error: function (xhr, status, error) {
                    console.error("Error fetching country data:", error);
                }
            });
        }
    });
});
