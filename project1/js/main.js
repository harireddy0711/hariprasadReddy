document.addEventListener("DOMContentLoaded", function () {
  const map = L.map("map").setView([20, 0], 2);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  const countrySelect = document.getElementById("countrySelect");

  let cityClusterGroup = L.markerClusterGroup();
  let airportClusterGroup = L.markerClusterGroup();
  const overlays = {
    "Cities": cityClusterGroup,
    "Airports": airportClusterGroup
  };

  L.control.layers(null, overlays).addTo(map);

  // Load countries into dropdown
  fetch("php/getCountries.php")
    .then(res => res.json())
    .then(data => {
      data.forEach(country => {
        const opt = document.createElement("option");
        opt.value = country.code;
        opt.textContent = country.name;
        countrySelect.appendChild(opt);
      });
    });

  countrySelect.addEventListener("change", () => {
    const code = countrySelect.value;
    if (!code) return;

    fetch(`php/getCountryData.php?code=${code}`)
      .then(res => res.json())
      .then(data => {
        map.eachLayer(layer => {
          if (layer.toGeoJSON) map.removeLayer(layer);
        });
        const layer = L.geoJSON(data, { color: "red" }).addTo(map);
        map.fitBounds(layer.getBounds());

        loadCityMarkers(code);
        loadAirportMarkers(code);
      });
  });

  function loadCityMarkers(code) {
    fetch(`php/getGeoMarkers.php?code=${code}`)
      .then(res => res.json())
      .then(data => {
        map.removeLayer(cityClusterGroup);
        cityClusterGroup = L.markerClusterGroup();

        data.forEach(marker => {
          const m = L.marker([marker.lat, marker.lng])
            .bindPopup(`<strong>${marker.name}</strong><br>Population: ${marker.population}`);
          cityClusterGroup.addLayer(m);
        });

        overlays["Cities"] = cityClusterGroup;
        map.addLayer(cityClusterGroup);
      });
  }

  function loadAirportMarkers(code) {
    fetch(`php/getAirports.php?code=${code}`)
      .then(res => res.json())
      .then(data => {
        map.removeLayer(airportClusterGroup);
        airportClusterGroup = L.markerClusterGroup();

        data.forEach(marker => {
          const m = L.marker([marker.lat, marker.lng])
            .bindPopup(`<strong>Airport:</strong> ${marker.name}`);
          airportClusterGroup.addLayer(m);
        });

        overlays["Airports"] = airportClusterGroup;
        map.addLayer(airportClusterGroup);
      });
  }

  function showModal(url, modalId, handler) {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        handler(data);
        new bootstrap.Modal(document.getElementById(modalId)).show();
      });
  }

  const searchInput = document.getElementById("searchCountryInput");
  const searchBtn = document.getElementById("searchCountryBtn");

  searchBtn.addEventListener("click", () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;

    for (let i = 0; i < countrySelect.options.length; i++) {
      const option = countrySelect.options[i];
      if (option.text.toLowerCase() === query) {
        countrySelect.value = option.value;
        countrySelect.dispatchEvent(new Event("change"));
        bootstrap.Modal.getInstance(document.getElementById("searchModal")).hide();
        return;
      }
    }

    alert("Country not found. Please type the full country name.");
  });

  setTimeout(() => {
    if (typeof L.easyButton === "function") {
      // Search Button
      L.easyButton('fa-search', () => {
        new bootstrap.Modal(document.getElementById("searchModal")).show();
      }, 'Search').addTo(map);

      // Wikipedia
      L.easyButton('fa-info-circle', () => {
        const countryName = countrySelect.options[countrySelect.selectedIndex].text;
        if (!countryName) return;
        showModal(`php/getWiki.php?country=${countryName}`, "wikiModal", data => {
          document.getElementById("wikiModalBody").innerHTML = `
            <h4>${data.title}</h4>
            <img src="${data.image}" class="img-fluid my-2" />
            <p>${data.summary}</p>
          `;
        });
      }, 'Info').addTo(map);

      // News
      L.easyButton('fa-newspaper', () => {
        const country = countrySelect.options[countrySelect.selectedIndex].text;
        if (!country) return;

        fetch(`php/getNews.php?country=${encodeURIComponent(country)}`)
          .then(res => res.json())
          .then(data => {
            const container = document.getElementById("newsModalBody");
            container.innerHTML = "";

            if (!Array.isArray(data) || data.length === 0 || data.error) {
              container.innerHTML = "<p>No news found.</p>";
              return;
            }

            data.forEach(article => {
              const card = document.createElement("div");
              card.className = "mb-3 p-3 border rounded shadow-sm";
              card.innerHTML = `
                <h5>${article.title}</h5>
                <small class="text-muted">${article.source || ''} — ${new Date(article.publishedAt).toLocaleString()}</small>
                <p>${article.description || ""}</p>
                <a href="${article.url}" target="_blank">Read more</a>
              `;
              container.appendChild(card);
            });

            new bootstrap.Modal(document.getElementById("newsModal")).show();
          });
      }, 'News').addTo(map);

      // Images
      L.easyButton('fa-image', () => {
        const countryName = countrySelect.options[countrySelect.selectedIndex].text;
        if (!countryName) return;
        showModal(`php/getImages.php?country=${countryName}`, "imagesModal", data => {
          const box = document.getElementById("imagesModalBody");
          box.innerHTML = "";
          data.forEach(url => {
            const img = document.createElement("img");
            img.src = url;
            img.className = "img-fluid m-2";
            box.appendChild(img);
          });
        });
      }, 'Images').addTo(map);

      // Weather
      L.easyButton('fa-cloud-sun', () => {
        const code = countrySelect.value;
        if (!code) return;
        showModal(`php/getWeather.php?code=${code}`, "weatherModal", data => {
          document.getElementById("weatherCity").textContent = data.city;
          document.getElementById("weatherTemp").textContent = data.temperature + "°C";
          document.getElementById("weatherDescription").textContent = data.description;
          document.getElementById("weatherHumidity").textContent = data.humidity + "%";
          document.getElementById("weatherWind").textContent = data.windSpeed + " km/h";
          document.getElementById("weatherIcon").src = data.icon;
        });
      }, 'Weather').addTo(map);

      // Currency Converter
      L.easyButton('fa-money-bill-wave', () => {
        const code = countrySelect.value;
        if (!code) return;
        showModal(`php/getCurrency.php?code=${code}`, "currencyModal", data => {
          const fromCurrency = data.currency;
          const rates = data.rates;
          const updated = data.updated;

          document.getElementById("exchangeFrom").textContent = fromCurrency;
          document.getElementById("exchangeUpdated").textContent = updated;

          const currencyTo = document.getElementById("currencyTo");
          currencyTo.innerHTML = "";
          Object.keys(rates).forEach(cur => {
            const opt = document.createElement("option");
            opt.value = cur;
            opt.textContent = cur;
            currencyTo.appendChild(opt);
          });

          const amountInput = document.getElementById("amountInput");
          const resultBox = document.getElementById("exchangeResult");

          amountInput.value = "";
          resultBox.textContent = "";

          const calculate = () => {
            const amount = parseFloat(amountInput.value);
            const toCurrency = currencyTo.value;
            const rate = rates[toCurrency];
            if (!isNaN(amount) && rate) {
              resultBox.textContent = (amount * rate).toFixed(2);
            } else {
              resultBox.textContent = "";
            }
          };

          amountInput.oninput = calculate;
          currencyTo.onchange = calculate;

          document.getElementById("clearExchange").onclick = () => {
            amountInput.value = "";
            resultBox.textContent = "";
          };
        });
      }, 'Currency').addTo(map);
    }
  }, 500);
});
