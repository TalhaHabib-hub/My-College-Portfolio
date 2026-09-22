(function () {
  "use strict";

  var GH_USER = "TalhaHabib-hub"; // change this if you rename your GitHub account

  // ---- Self-rated skill scores (0-100). Edit these yourself, GitHub has
  // no API for "how good are you at X" — this part is honest opinion, not
  // scraped data. ----
  var SKILLS = {
    "Frontend": 82,
    "Backend": 68,
    "AI integration": 55,
    "Tools & Git": 75,
    "Databases": 60
  };

  var COVE = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948"];

  var LANG_COLOR = {
    "JavaScript": "#eda100",
    "HTML": "#eb6834",
    "CSS": "#6250d6",
    "PHP": "#2a78d6",
    "Python": "#1baf7a",
    "C++": "#e87ba4",
    "TypeScript": "#2a78d6",
    "Java": "#e34948",
    "Blade": "#eb6834",
    "C": "#008300",
    "Shell": "#1baf7a"
  };

  var elRepos  = document.getElementById("ghRepos");
  var elStars  = document.getElementById("ghStars");
  var elLangs  = document.getElementById("ghLangs");
  var elFollow = document.getElementById("ghFollow");
  var elStatus = document.getElementById("ghStatus");
  var elHeatmap = document.getElementById("ghHeatmap");
  var elHeatmapRange = document.getElementById("ghHeatmapRange");
  var elStackBar = document.getElementById("ghStackBar");
  var elStackBarLegend = document.getElementById("ghStackBarLegend");
  var elDonutLegend = document.getElementById("ghDonutLegend");

  if (!elRepos) return; // section not on this page

  function animateCount(el, target) {
    var startTime = null;
    var duration = 700;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      el.textContent = Math.floor(progress * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  function colorFor(name, index) {
    return LANG_COLOR[name] || COVE[index % COVE.length];
  }

  function topLanguages(byteTotals, limit) {
    var grandTotal = Object.keys(byteTotals).reduce(function (s, k) { return s + byteTotals[k]; }, 0);
    var sorted = Object.keys(byteTotals)
      .map(function (name) { return { name: name, bytes: byteTotals[name] }; })
      .sort(function (a, b) { return b.bytes - a.bytes; });

    var top = sorted.slice(0, limit);
    var rest = sorted.slice(limit).reduce(function (s, e) { return s + e.bytes; }, 0);
    if (rest > 0) top.push({ name: "Other", bytes: rest });

    return top.map(function (e, i) {
      return { name: e.name, bytes: e.bytes, pct: grandTotal ? (e.bytes / grandTotal) * 100 : 0, color: e.name === "Other" ? "#5a5a5a" : colorFor(e.name, i) };
    });
  }

  // ---------- 2. Donut ----------
  function renderDonut(langEntries) {
    var canvas = document.getElementById("ghDonut");
    if (!canvas || !window.Chart) return;

    new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: langEntries.map(function (e) { return e.name; }),
        datasets: [{
          data: langEntries.map(function (e) { return Math.round(e.pct * 10) / 10; }),
          backgroundColor: langEntries.map(function (e) { return e.color; }),
          borderColor: "#10141C",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: { legend: { display: false }, tooltip: { callbacks: {
          label: function (ctx) { return ctx.label + ": " + ctx.parsed + "%"; }
        } } }
      }
    });

    elDonutLegend.innerHTML = langEntries.map(function (e) {
      var pct = e.pct < 1 ? e.pct.toFixed(1) : Math.round(e.pct);
      return '<span class="gh-donut-legend__item"><span class="gh-donut-legend__swatch" style="background:' + e.color + '"></span>' + e.name + " " + pct + "%</span>";
    }).join("");
  }

  // ---------- 4. Stacked bar ----------
  function renderStackBar(langEntries) {
    elStackBar.innerHTML = langEntries.map(function (e) {
      return '<div class="gh-stackbar__segment" style="width:' + e.pct + '%; background:' + e.color + '"></div>';
    }).join("");

    elStackBarLegend.innerHTML = langEntries.map(function (e) {
      var pct = e.pct < 1 ? e.pct.toFixed(1) : Math.round(e.pct);
      return '<span class="gh-stackbar__legend-item"><span class="gh-stackbar__legend-swatch" style="background:' + e.color + '"></span>' + e.name + " " + pct + "%</span>";
    }).join("");
  }

  // ---------- 3. Radar (static, self-rated) ----------
  function renderRadar() {
    var canvas = document.getElementById("ghRadar");
    if (!canvas || !window.Chart) return;

    var labels = Object.keys(SKILLS);
    var data = labels.map(function (k) { return SKILLS[k]; });

    new Chart(canvas, {
      type: "radar",
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: "rgba(47, 230, 221, 0.18)",
          borderColor: "#2FE6DD",
          pointBackgroundColor: "#2FE6DD",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { display: false, backdropColor: "transparent" },
            grid: { color: "rgba(255,255,255,0.08)" },
            angleLines: { color: "rgba(255,255,255,0.08)" },
            pointLabels: { color: "#9CA5B8", font: { size: 11 } }
          }
        }
      }
    });
  }

  // ---------- 1. Contribution heatmap ----------
  function renderHeatmap(pushDates) {
    // pushDates: array of "YYYY-MM-DD" strings, one entry per push event day
    var counts = {};
    pushDates.forEach(function (d) { counts[d] = (counts[d] || 0) + 1; });

    var days = 90;
    var today = new Date();
    var cells = [];
    for (var i = days - 1; i >= 0; i--) {
      var d = new Date(today);
      d.setDate(d.getDate() - i);
      var key = d.toISOString().slice(0, 10);
      cells.push({ date: key, count: counts[key] || 0 });
    }

    var max = Math.max.apply(null, cells.map(function (c) { return c.count; }).concat([1]));

    elHeatmap.innerHTML = "";
    cells.forEach(function (c) {
      var level = c.count === 0 ? 0 : Math.min(4, Math.ceil((c.count / max) * 4));
      var cell = document.createElement("div");
      cell.className = "gh-heatmap__cell";
      cell.setAttribute("data-level", level);
      cell.title = c.date + ": " + c.count + " push" + (c.count === 1 ? "" : "es");
      elHeatmap.appendChild(cell);
    });
  }

  function loadGitHubActivity() {
    var userUrl   = "https://api.github.com/users/" + GH_USER;
    var reposUrl  = "https://api.github.com/users/" + GH_USER + "/repos?per_page=100";
    var eventsUrl = "https://api.github.com/users/" + GH_USER + "/events/public?per_page=100";

    Promise.all([
      fetch(userUrl).then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); }),
      fetch(reposUrl).then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); }),
      fetch(eventsUrl).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; })
    ])
      .then(function (results) {
        var user   = results[0];
        var repos  = results[1];
        var events = results[2];

        var totalStars = repos.reduce(function (sum, repo) { return sum + (repo.stargazers_count || 0); }, 0);

        var pushDates = events
          .filter(function (e) { return e.type === "PushEvent"; })
          .map(function (e) { return e.created_at.slice(0, 10); });
        renderHeatmap(pushDates);
        elHeatmapRange.textContent = events.length
          ? "Last ~90 days of public GitHub activity"
          : "No recent public push events found (private repos don't show here)";

        var langFetches = repos
          .filter(function (repo) { return !repo.fork; })
          .map(function (repo) {
            return fetch(repo.languages_url).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; });
          });

        return Promise.all(langFetches).then(function (langResults) {
          var byteTotals = {};
          langResults.forEach(function (langs) {
            Object.keys(langs).forEach(function (name) {
              byteTotals[name] = (byteTotals[name] || 0) + langs[name];
            });
          });

          animateCount(elRepos, user.public_repos || repos.length);
          animateCount(elStars, totalStars);
          animateCount(elLangs, Object.keys(byteTotals).length);
          animateCount(elFollow, user.followers || 0);

          var langEntries = topLanguages(byteTotals, 6);
          renderDonut(langEntries);
          renderStackBar(langEntries);
          renderRadar();

          elStatus.textContent = "";
        });
      })
      .catch(function () {
        elRepos.textContent = "20+";
        elStars.textContent = "—";
        elLangs.textContent = "6+";
        elFollow.textContent = "—";
        elHeatmapRange.textContent = "Live stats temporarily unavailable";
        renderRadar(); // radar is static, still show it
        elStatus.textContent = "Live stats temporarily unavailable — showing recent snapshot.";
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadGitHubActivity);
  } else {
    loadGitHubActivity();
  }
})();