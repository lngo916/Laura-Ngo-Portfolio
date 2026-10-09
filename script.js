const nav = document.querySelector('.nav nav'),
  menu = document.querySelector('.menu');
menu?.addEventListener('click', () => {
  nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
  nav.style.position = 'absolute';
  nav.style.top = '74px';
  nav.style.right = '5vw';
  nav.style.background = '#111613';
  nav.style.padding = '20px';
  nav.style.flexDirection = 'column'
});

const observer = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) {
    e.target.classList.add('visible');
    observer.unobserve(e.target)
  }
}), { threshold: .12 });
document.querySelectorAll('.project,.section-top,.about-copy,.about-panel,.stack-cloud,.timeline,.contact-inner').forEach(x => {
  x.classList.add('reveal');
  observer.observe(x)
});

const cursor = document.querySelector('.cursor'), ring = document.querySelector('.cursor-ring');
window.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px';
  ring.animate({ left: e.clientX + 'px', top: e.clientY + 'px' }, { duration: 450, fill: 'forwards' })
});
document.querySelectorAll('a,button,.project').forEach(x => x.addEventListener('mouseenter', () => { ring.style.width = '50px'; ring.style.height = '50px' }));
document.querySelectorAll('a,button,.project').forEach(x => x.addEventListener('mouseleave', () => { ring.style.width = '32px'; ring.style.height = '32px' }));
document.getElementById('year').textContent = new Date().getFullYear();

// Theme toggle
(function () {
  const root = document.documentElement;
  const button = document.querySelector('.theme-toggle');
  if (!button) return;
  let saved = null;
  try { saved = localStorage.getItem('laura-theme'); } catch (e) { }
  const systemLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const initial = (saved === 'light' || saved === 'dark') ? saved : (systemLight ? 'light' : 'dark');

  function setTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    const light = theme === 'light';
    button.setAttribute('aria-pressed', String(light));
    button.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    button.setAttribute('title', light ? 'Switch to dark mode' : 'Switch to light mode');
    if (persist) { try { localStorage.setItem('laura-theme', theme); } catch (e) { } }
  }
  setTheme(initial, false);
  button.addEventListener('click', function () {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    setTheme(next, true);
  });
})();

const portfolioAucCanvas = document.getElementById('portfolioAucChart');

if (portfolioAucCanvas) {
  new Chart(portfolioAucCanvas, {
    type: 'bar',
    data: {
      labels: [
        'XGBoost',
        'Random Forest',
        'Logistic Regression',
        'Decision Tree',
        'SVM'
      ],
      datasets: [{
        data: [0.877, 0.852, 0.826, 0.826, 0.753],
        backgroundColor: [
          '#b9dcf9',
          '#6fa8d4',
          '#4d8ab8',
          '#4d8ab8',
          '#3a6f9e'
        ],
        borderWidth: 0,
        borderRadius: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return ' AUC-ROC: ' + context.raw.toFixed(3);
            }
          }
        }
      },

      scales: {
        y: {
          min: 0.7,
          max: 0.9,
          ticks: {
            color: '#8494aa',
            font: {
              family: 'DM Mono',
              size: 9
            }
          },
          grid: {
            color: 'rgba(132, 148, 170, 0.15)'
          }
        },

        x: {
          ticks: {
            color: '#8494aa',
            font: {
              family: 'DM Mono',
              size: 8
            },
            maxRotation: 0
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// Earthquake 
const globeSvg = d3.select("#portfolioEarthquakeGlobe");

if (!globeSvg.empty()) {

  const globeContainer = document.querySelector(".earthquake-globe");

  let globeWidth;
  let globeHeight;
  let globeRadius;

  const projection = d3.geoOrthographic()
    .clipAngle(90);

  const path = d3.geoPath()
    .projection(projection);

  const globeGroup = globeSvg.append("g");

  const sphere = globeGroup.append("path")
    .datum({ type: "Sphere" })
    .attr("class", "globe-sphere");

  const countriesGroup = globeGroup.append("g");

  const earthquakesGroup = globeGroup.append("g");

  let rotation = [0, -15, 0];

  function resizeEarthquakeGlobe() {

    const rect = globeContainer.getBoundingClientRect();

    globeWidth = rect.width;
    globeHeight = rect.height;

    globeSvg
      .attr("viewBox", `0 0 ${globeWidth} ${globeHeight}`);

    globeRadius = Math.min(globeWidth, globeHeight) * .3;

    projection
      .translate([globeWidth / 2, globeHeight / 2])
      .scale(globeRadius)
      .rotate(rotation);

    sphere.attr("d", path);

    countriesGroup
      .selectAll("path")
      .attr("d", path);

    earthquakesGroup
      .selectAll("circle")
      .each(function (d) {

        const point = projection([
          d.longitude,
          d.latitude
        ]);

        d3.select(this)
          .attr("cx", point[0])
          .attr("cy", point[1])
          .attr(
            "opacity",
            isGlobePointVisible(
              d.longitude,
              d.latitude
            ) ? .9 : 0
          );
      });
  }

  function isGlobePointVisible(lon, lat) {

    const coordinate = projection([
      lon,
      lat
    ]);

    if (!coordinate) return false;

    const center = [
      globeWidth / 2,
      globeHeight / 2
    ];

    const distance = Math.sqrt(
      Math.pow(coordinate[0] - center[0], 2) +
      Math.pow(coordinate[1] - center[1], 2)
    );

    return distance <= globeRadius;
  }

  // Load world map
  d3.json(
    "https://unpkg.com/world-atlas@2/countries-110m.json"
  ).then(worldData => {

    const countries = topojson.feature(
      worldData,
      worldData.objects.countries
    ).features;

    countriesGroup
      .selectAll("path")
      .data(countries)
      .enter()
      .append("path")
      .attr("class", "globe-country")
      .attr("d", path);

    loadEarthquakeData();

  }).catch(error => {
    console.error("Could not load globe data:", error);
  });

  // USGS earthquake data
  function loadEarthquakeData() {

    d3.json(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
    ).then(data => {

      const earthquakes = data.features
        .map(d => ({
          longitude: d.geometry.coordinates[0],
          latitude: d.geometry.coordinates[1],
          mag: d.properties.mag || 0
        }))
        .filter(d =>
          d.longitude !== null &&
          d.latitude !== null &&
          d.mag >= 2.5
        );

      const minMag = d3.min(
        earthquakes,
        d => d.mag
      );

      const maxMag = d3.max(
        earthquakes,
        d => d.mag
      );

      const magnitudeScale = d3.scaleLinear()
        .domain([minMag, maxMag])
        .range([2, 6]);

      const colorScale = d3.scaleLinear()
        .domain([minMag, maxMag])
        .range(["#5da9ff", "#ffffff"]);

      earthquakesGroup
        .selectAll("circle")
        .data(earthquakes)
        .enter()
        .append("circle")
        .attr("class", "globe-quake")
        .attr("r", d => magnitudeScale(d.mag))
        .attr("fill", d => colorScale(d.mag))
        .attr("cx", d => projection([
          d.longitude,
          d.latitude
        ])[0])
        .attr("cy", d => projection([
          d.longitude,
          d.latitude
        ])[1])
        .attr(
          "opacity",
          d =>
            isGlobePointVisible(
              d.longitude,
              d.latitude
            ) ? .9 : 0
        );

      resizeEarthquakeGlobe();

      spinEarthquakeGlobe();

    }).catch(error => {
      console.error(
        "Could not load earthquake data:",
        error
      );
    });
  }

  let lastGlobeUpdate = 0;

function spinEarthquakeGlobe(timestamp) {

    if (timestamp - lastGlobeUpdate < 50) {
        requestAnimationFrame(spinEarthquakeGlobe);
        return;
    }

    lastGlobeUpdate = timestamp;

    rotation[0] += 0.08;

    projection.rotate(rotation);

    sphere.attr("d", path);

    countriesGroup
        .selectAll("path")
        .attr("d", path);

    earthquakesGroup
        .selectAll("circle")
        .each(function(d) {

            const point = projection([
                d.longitude,
                d.latitude
            ]);

            if (!point) return;

            d3.select(this)
                .attr("cx", point[0])
                .attr("cy", point[1])
                .attr(
                    "opacity",
                    isGlobePointVisible(
                        d.longitude,
                        d.latitude
                    ) ? .9 : 0
                );
        });

    requestAnimationFrame(spinEarthquakeGlobe);
}

  window.addEventListener(
    "resize",
    resizeEarthquakeGlobe
  );
}

