document.addEventListener("DOMContentLoaded", function () {
  const formatDate = (date, format = "dddd, MMMM d, yyyy h:mm tt") => {
    if (!date) return "";
    const d = (typeof date === "string" || typeof date === "number") ? new Date(date) : date;
    return d.toString(format);
  };

  const map = L.map("map").setView([20, 0], 2);

  const cityClusterGroup = L.markerClusterGroup();
  const airportClusterGroup = L.markerClusterGroup();

  const overlays = {
    "Cities": cityClusterGroup,
    "Airports": airportClusterGroup
  };

  const baseMaps = {
    "Light": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }),
    "Dark": L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap & CartoDB"
    }),
    "Satellite": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles © Esri"
    })
  };

  baseMaps["Light"].addTo(map);
  L.control.layers(baseMaps, overlays).addTo(map);

  const countrySelect = document.getElementById("countrySelect");

  fetch("php/getCountries.php")
    .then(res => res.ok ? res.json() : Promise.reject("Failed to load countries"))
    .then(data => {
      data.forEach(country => {
        const opt = document.createElement("option");
        opt.value = country.code;
        opt.textContent = country.name;
        countrySelect.appendChild(opt);
      });

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async pos => {
          const { latitude, longitude } = pos.coords;
          const response = await fetch(`php/reverseGeocode.php?lat=${latitude}&lon=${longitude}`);
          const geo = await response.json();
          const code = geo.address?.country_code?.toUpperCase();

          if (code) {
            const match = Array.from(countrySelect.options).find(opt => opt.value === code);
            if (match) {
              countrySelect.value = code;
              countrySelect.dispatchEvent(new Event("change"));
            }
          }
          document.getElementById("preloader").style.display = "none";
        }, () => document.getElementById("preloader").style.display = "none");
      } else {
        document.getElementById("preloader").style.display = "none";
      }
    })
    .catch(err => {
      console.error(err);
      alert("Could not load countries.");
      document.getElementById("preloader").style.display = "none";
    });

  countrySelect.addEventListener("change", () => {
    const code = countrySelect.value;
    if (!code) return;

    fetch(`php/getCountryData.php?code=${code}`)
      .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch country data"))
      .then(data => {
        map.eachLayer(layer => {
          if (layer.toGeoJSON) map.removeLayer(layer);
        });

        const layer = L.geoJSON(data, { color: "red" }).addTo(map);
        map.fitBounds(layer.getBounds());

        loadCityMarkers(code);
        loadAirportMarkers(code);
      })
      .catch(err => alert("Error loading country data: " + err));
  });

  const cityIcon = L.ExtraMarkers.icon({
    icon: 'fa-city', markerColor: 'blue', shape: 'circle', prefix: 'fa'
  });

  const airportIcon = L.ExtraMarkers.icon({
    icon: 'fa-plane', markerColor: 'green', shape: 'square', prefix: 'fa'
  });

  function loadCityMarkers(code) {
    fetch(`php/getGeoMarkers.php?code=${code}`)
      .then(res => res.ok ? res.json() : Promise.reject("Failed to load city markers"))
      .then(data => {
        map.removeLayer(cityClusterGroup);
        cityClusterGroup.clearLayers();
        data.forEach(marker => {
          const m = L.marker([marker.lat, marker.lng], { icon: cityIcon })
            .bindPopup(`<strong>${marker.name}</strong><br>Population: ${numeral(marker.population).format('0,0')}`);
          cityClusterGroup.addLayer(m);
        });
        map.addLayer(cityClusterGroup);
      })
      .catch(err => console.error("City marker error:", err));
  }

  function loadAirportMarkers(code) {
    fetch(`php/getAirports.php?code=${code}`)
      .then(res => res.ok ? res.json() : Promise.reject("Failed to load airport markers"))
      .then(data => {
        map.removeLayer(airportClusterGroup);
        airportClusterGroup.clearLayers();
        data.forEach(marker => {
          const m = L.marker([marker.lat, marker.lng], { icon: airportIcon })
            .bindPopup(`<strong>Airport:</strong> ${marker.name}`);
          airportClusterGroup.addLayer(m);
        });
        map.addLayer(airportClusterGroup);
      })
      .catch(err => console.error("Airport marker error:", err));
  }

  function showModal(url, modalId, handler) {
    fetch(url)
      .then(res => res.ok ? res.json() : Promise.reject("Modal data fetch failed"))
      .then(data => {
        handler(data);
        new bootstrap.Modal(document.getElementById(modalId)).show();
      })
      .catch(err => alert("Modal error: " + err));
  }

  setTimeout(() => {
    if (typeof L.easyButton === "function") {
      const buttons = [
        {
          icon: 'fa-info-circle', title: 'Info', handler: () => {
            const code = countrySelect.value;
            fetch(`php/getCountryInfo.php?country=${code}`)
              .then(res => res.json())
              .then(data => {
                if (data.error) return alert(data.error);
                const area = numeral(data.area).format('0,0');
                const pop = numeral(data.population).format('0,0');
                document.getElementById("wikiModalBody").innerHTML = `
                  <table class="table table-bordered text-center">
                    <tr><th>Name</th><td class="text-danger">${data.name}</td></tr>
                    <tr><th>Capital City</th><td class="text-success">${data.capital}</td></tr>
                    <tr><th>Population</th><td>${pop}</td></tr>
                    <tr><th>Currency</th><td>${data.currency}</td></tr>
                    <tr><th>Languages</th><td>${data.languages}</td></tr>
                    <tr><th>Continent</th><td>${data.continent}</td></tr>
                    <tr><th>Area</th><td>${area} km²</td></tr>
                    <tr><th>Flag</th><td><img src="${data.flag}" height="30"></td></tr>
                  </table>`;
                new bootstrap.Modal(document.getElementById("wikiModal")).show();
              });
          }
        },
        {
          icon: 'fa-newspaper', title: 'News', handler: () => {
            const name = countrySelect.options[countrySelect.selectedIndex].text;
            showModal(`php/getNews.php?country=${encodeURIComponent(name)}`, "newsModal", data => {
              const container = document.getElementById("newsModalBody");
              container.innerHTML = "";
              if (!Array.isArray(data) || data.length === 0 || data.error) {
                container.innerHTML = `<p class="text-muted text-center">No news found for ${name}.</p>`;
                return;
              }
              data.forEach(article => {
                const card = document.createElement("div");
                card.className = "card mb-3 shadow-sm";
                card.innerHTML = `
                  <div class="card-body">
                    <h5 class="card-title">${article.title}</h5>
                    <p class="card-text">${article.description || ""}</p>
                    <p class="card-text">
                      <small class="text-muted">${article.source} — ${formatDate(article.publishedAt)}</small>
                    </p>
                    <a href="${article.url}" target="_blank" class="btn btn-outline-primary btn-sm">Read more</a>
                  </div>`;
                container.appendChild(card);
              });
            });
          }
        },
        {
          icon: 'fa-image', title: 'Images', handler: () => {
            const name = countrySelect.options[countrySelect.selectedIndex].text;
            showModal(`php/getImages.php?country=${name}`, "imagesModal", data => {
              const box = document.getElementById("imagesModalBody");
              box.innerHTML = "";
              data.forEach(url => {
                const img = document.createElement("img");
                img.src = url;
                img.className = "img-fluid m-2";
                box.appendChild(img);
              });
            });
          }
        },
        {
          icon: 'fa-cloud-sun', title: 'Weather', handler: () => {
            const code = countrySelect.value;
            showModal(`php/getWeather.php?code=${code}`, "weatherModal", data => {
              const modalBody = document.getElementById("weatherModalBody");
              if (!modalBody) return;
              if (data.error) {
                modalBody.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
                return;
              }
              let html = `
                <div class="text-center mb-3">
                  <div><small>Updated: ${formatDate(new Date())}</small></div>
                  <h2>${data.city}</h2>
                  <img src="${data.icon}" class="img-fluid my-2" alt="Weather Icon"/>
                  <h3>${Math.round(data.temperature)}°C</h3>
                  <p class="mb-1 text-capitalize">${data.description}</p>
                  <p>Humidity: ${data.humidity}% | Wind: ${data.windSpeed} km/h</p>
                </div>`;
              if (Array.isArray(data.forecast)) {
                html += `<div class="row text-center">`;
                data.forecast.forEach(day => {
                  html += `
                    <div class="col-4">
                      <strong>${formatDate(day.date, "ddd, MMM d")}</strong><br/>
                      <img src="${day.icon}" alt="" style="width:40px;"><br/>
                      ${Math.round(day.max)}°C / ${Math.round(day.min)}°C
                    </div>`;
                });
                html += `</div>`;
              }
              modalBody.innerHTML = html;
            });
          }
        },
        {
          icon: 'fa-money-bill-wave', title: 'Currency', handler: () => {
            const code = countrySelect.value;
            showModal(`php/getCurrency.php?code=${code}`, "currencyModal", data => {
              if (!data || !data.currency || !data.rates) {
                alert("Currency data unavailable for this country.");
                return;
              }
              document.getElementById("exchangeFrom").textContent = data.currency;
              const updatedDate = new Date(data.updated);
              document.getElementById("exchangeUpdated").textContent = 
              isNaN(updatedDate) ? "Unavailable" : updatedDate.toString("dddd, MMMM d, yyyy h:mm tt");


              const currencyTo = document.getElementById("currencyTo");
              currencyTo.innerHTML = "";
              Object.keys(data.rates).forEach(cur => {
                const opt = document.createElement("option");
                opt.value = cur;
                opt.textContent = cur;
                currencyTo.appendChild(opt);
              });
              const amountInput = document.getElementById("amountInput");
              const resultBox = document.getElementById("exchangeResult");
              amountInput.value = "1";
              const rate = data.rates[currencyTo.value];
              resultBox.textContent = rate ? numeral(rate).format('0,0.00') : "";

              const calculate = () => {
                const amount = parseFloat(amountInput.value);
                const rate = data.rates[currencyTo.value];
                resultBox.textContent = (!isNaN(amount) && rate) ? numeral(amount * rate).format('0,0.00') : "";
              };
              amountInput.oninput = calculate;
              currencyTo.onchange = calculate;
              document.getElementById("clearExchange").onclick = () => {
                amountInput.value = "";
                resultBox.textContent = "";
              };
            });
          }
        }
      ];
      buttons.forEach(btn => L.easyButton(btn.icon, btn.handler, btn.title).addTo(map));
    }
  }, 300);
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('hidden.bs.modal', function () {
      document.body.classList.remove('modal-open');
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    });
  });
  
});
